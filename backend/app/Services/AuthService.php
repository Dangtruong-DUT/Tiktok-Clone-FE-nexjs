<?php

namespace App\Services;

use App\Enums\User\UserVerifyStatusEnum;
use App\Exceptions\http\BadRequestException;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\UnauthorizedException;
use App\Mail\ForgotPasswordMail;
use App\Mail\VerifyUserEmail;
use App\Models\ForgotPasswordToken;
use App\Models\RefreshToken;
use App\Repositories\ForgotPasswordTokenRepository;
use App\Repositories\RefreshTokenRepository;
use App\Repositories\UserRepository;
use App\Repositories\VerifyEmailTokenRepository;
use App\Traits\HasAuthUser;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthService
{
    use HasAuthUser;

    private const ACCESS_TOKEN_TYPE = 0;
    private const REFRESH_TOKEN_TYPE = 1;

    /**
     * AuthService constructor.
     */
    public function __construct(
        private readonly UserRepository $userRepo,
        private readonly RefreshTokenRepository $refreshRepo,
        private readonly ForgotPasswordTokenRepository $forgotPasswordTokenRepo,
        private readonly VerifyEmailTokenRepository $verifyEmailTokenRepo
    ) {}


    /**
     * Attempt to log the user in and return the access token and refresh token.
     *
     * @param array $credentials
     * @return array
     */
    public function login(array $credentials): array
    {
        if (!$this->guard()->attempt($credentials)) {
            throw new UnauthorizedException('Email or password is incorrect');
        }
        $user = $this->guard()->user();
        $accessToken = $this->createAccessToken($user);
        $refreshToken = $this->createRefreshToken($user);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => $user
        ];
    }


    /**
     * Log the user out by invalidating the refresh token.
     *
     * @param string $refreshToken
     * @return bool
     */
    public function logout(string $refreshToken): bool
    {
        $token = $this->verifyRefreshToken($refreshToken);
        $this->guard()->logout();
        $this->refreshRepo->delete($token->id); // @phpstan-ignore-line
        return true;
    }

    /**
     * Log the user out from all devices by invalidating all refresh tokens.
     * @param string $refreshToken
     * @return bool
     */
    public function logoutAll(string $refreshToken): bool
    {
        $this->verifyRefreshToken($refreshToken);
        $user = $this->guard()->user();
        $this->guard()->logout();
        $this->refreshRepo->deleteByUserId($user->id);
        return true;
    }

    /**
     * Refresh the access token using the refresh token.
     *
     * @param string $refreshToken
     * @return string
     */
    public function refresh(string $refreshToken): array
    {
        $token = $this->verifyRefreshToken($refreshToken);
        $user = $this->userRepo->findOrFail($token->user_id);

        $this->refreshRepo->delete($token->id); // @phpstan-ignore-line
        $newAccessToken = $this->createAccessToken($user);
        $newRefreshToken = $this->createRefreshToken($user);

        return [
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken,
            'user' => $user,
        ];
    }

    /**
     * Register for new User
     * @param array $data
     * @return array
     */
    public function register(array $data): array
    {
        $isExist = $this->userRepo->checkExistByEmail($data['email']);
        if ($isExist) {
            throw new BusinessException(
            'Email already exists',
            ['email' => 'The email address is already registered. Please use a different email.']
            );
        }

        $user = $this->userRepo->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'date_of_birth' => $data['date_of_birth'],
        ]);
        $accessToken = $this->createAccessToken($user);
        $refreshToken = $this->createRefreshToken($user);
        $verifyToken = $this->createVerifyEmailToken($user);
        Mail::to($data['email'])->send(new VerifyUserEmail($user, $verifyToken));

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => $user
        ];
    }

    /**
     * Handle verify email request by verifying the token and activating the user's account.
     *
     * @param array $credentials
     * @return bool
     */
    public function verifyEmail(array $credentials): array
    {
        $token = $credentials['email_verify_token'];
        $validToken = $this->verifyEmailTokenRepo->findByToken($token);
        if (empty($validToken)) {
            throw new BadRequestException('Invalid token');
        }
        if ($validToken->isExpired()) {
            $this->verifyEmailTokenRepo->delete($validToken->id);
            throw new BadRequestException('Token has expired');
        }
        $user = $this->userRepo->findOrFail($validToken->user_id);
        $user->verify = UserVerifyStatusEnum::VERIFIED->value;
        $user->save();
        $this->verifyEmailTokenRepo->deleteByUserId($validToken->user_id);

        return [
            'access_token' => $this->createAccessToken($user),
            'refresh_token' => $this->createRefreshToken($user),
            'user' => $user,
        ];
    }

    /**
     * Get the authenticated user's profile.
     *
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function me(): \Illuminate\Contracts\Auth\Authenticatable|null
    {
        return $this->guard()->user();
    }

    /**
     * Handle forgot password request by sending a reset link to the user's email.
     *
     * @param string $email
     * @return bool
     */
    public function forgot(string $email): bool
    {
        $user = $this->userRepo->findByEmail($email);
        if (!$user) {
            throw new BusinessException(
                'Email not found',
                ['email' => 'The email address is not registered. Please check and try again.']
            );
        }
        $token = $this->createForgotPasswordToken($user);
        Mail::to($email)->send(new ForgotPasswordMail($user,$token));

        return true;
    }

    /**
     * Handle verify forgot password request by verifying the token and resetting the password.
     *
     * @param array $credentials
     * @return ForgotPasswordToken
     */
    public function verifyForgotToken(array $credentials): ForgotPasswordToken
    {
        $token = $credentials['forgot_password_token'];
        $validToken = $this->forgotPasswordTokenRepo->findByToken($token);
        if (empty($validToken)) {
            throw new BadRequestException('Invalid token');
        }
        if ($validToken->isExpired()) {
            $this->forgotPasswordTokenRepo->delete($validToken->id);
            throw new BadRequestException('Token has expired');
        }
        return $validToken;
    }

    /**
     * Handle refresh token verification by verifying the token and returning the associated user.
     *
     * @param string $refreshToken
     * @return RefreshToken
     */
    public function verifyRefreshToken(string $refreshToken): RefreshToken
    {
        try {
            $payload = JWTAuth::setToken($refreshToken)->getPayload();
        } catch (JWTException $exception) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if ((int) ($payload->get('token_Type') ?? -1) !== self::REFRESH_TOKEN_TYPE) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        $token = $this->refreshRepo->findByToken($refreshToken);
        if (!$token) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if ((int) $payload->get('sub') !== (int) $token->user_id) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if ($token->isExpired()) {
            $this->refreshRepo->delete($token->id);
            throw new UnauthorizedException('Refresh token has expired');
        }
        return $token;
    }

    /**
     * Handle reset password request by resetting the user's password.
     *
     * @param array $credentials
     * @return bool
     */
    public function resetPassword(array $credentials): bool
    {
        $validToken= $this->verifyForgotToken($credentials);
        $this->forgotPasswordTokenRepo->deleteByUserId($validToken->user_id);
        $user = $this->userRepo->findOrFail($validToken->user_id);
        $user->password = $credentials['password'];
        $user->save();
        return true;
    }

    /**
     * Create refreshtoken.
     * @param $user
     * @return string
     */
    private function createRefreshToken($user): string
    {
        JWTAuth::factory()->setTTL((int) config('jwt.refresh_ttl', 20160));
        $refreshToken = JWTAuth::claims($this->buildTokenClaims($user, self::REFRESH_TOKEN_TYPE))
            ->fromUser($user);

        $this->refreshRepo->create(
            [
                'user_id' => $user->id,
                'token' => $refreshToken,
                'expires_at' => now()->addMinutes((int)config('jwt.refresh_ttl', 20160))
            ]
        );
        return $refreshToken;
    }

    /**
     * Create access token.
     * @param mixed $user
     * @return string
     */
    private function createAccessToken($user): string
    {
        JWTAuth::factory()->setTTL((int) config('jwt.ttl', 60));
        return JWTAuth::claims($this->buildTokenClaims($user, self::ACCESS_TOKEN_TYPE))
            ->fromUser($user);
    }

    /**
     * Build custom token claims.
     * @param mixed $user
     * @param int $tokenType
     * @return array<string, mixed>
     */
    private function buildTokenClaims($user, int $tokenType): array
    {
        return [
            'user_id' => (string) $user->uuid,
            'uuid' => $user->uuid,
            'verify' => $user->verify->value,
            'role' => $user->role->value,
            'token_Type' => $tokenType,
        ];
    }

    /**
     * Create forgot password token.
     * @param $user
     * @return string
     */
    private function createForgotPasswordToken($user): string
    {
        $token = Str::random((int)config('auth.reset_password.token_length', 64));
        $this->forgotPasswordTokenRepo->create(
            [
                'user_id' => $user->id,
                'token' => $token,
                'expires_at' => now()->addMinutes((int)config('auth.reset_password.expire', 60))
            ]
        );
        return $token;
    }

    /**
     * Create verify email token.
     * @param $user
     * @return string
     */
    public function createVerifyEmailToken($user): string
    {
        $token = Str::random((int)config('auth.verification.token_length', 64));
        $this->verifyEmailTokenRepo->create(
            [
                'user_id' => $user->id,
                'token' => $token,
                'expires_at' => now()->addMinutes((int)config('auth.verification.expire', 60))
            ]
        );
        return $token;
    }
}
