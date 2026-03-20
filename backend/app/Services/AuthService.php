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

class AuthService
{
    use HasAuthUser;

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
        if (!$token = $this->guard()->attempt($credentials)) {
            throw new UnauthorizedException('Email or password is incorrect');
        }
        $user = $this->guard()->user();
        $refreshToken = $this->createRefreshToken($user);

        return [
            'access_token' => $token,
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
        $user = $this->guard()->user();
        $token = $this->findValidToken($user, $refreshToken);
        if (!$token) {
            throw new UnauthorizedException('Invalid refresh token');
        };
        $this->guard()->logout();
        $this->refreshRepo->delete($token->id); // @phpstan-ignore-line
        return true;
    }

    /**
     * Log the user out from all devices by invalidating all refresh tokens.
     *
     * @return bool
     */
    public function logoutAll(): bool
    {
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
    public function refresh(string $refreshToken): string
    {
        $user = $this->guard()->user();
        $token = $this->findValidToken($user, $refreshToken);
        if (!$token) {
            throw new UnauthorizedException('Invalid refresh token');
        };

        if ($token->isExpired()) {
            throw new UnauthorizedException('Refresh token has expired');
        }

        return $this->guard()->refresh();
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
        $refreshToken = $this->createRefreshToken($user);
        // @phpstan-ignore argument.type
        $accessToken = $this->guard()->login($user);
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
    public function verifyEmail(array $credentials): bool
    {
        $token = $credentials['email_verify_token'];
        $validToken = $this->verifyEmailTokenRepo->findByToken($token);
        if (empty($validToken)) {
            throw new BadRequestException('Invalid token');
        }
        if ($validToken->isExpired()) {
            throw new BadRequestException('Token has expired');
        }
        $user = $this->userRepo->findOrFail($validToken->user_id);
        $user->verify = UserVerifyStatusEnum::VERIFIED->value;
        $user->save();
        $this->verifyEmailTokenRepo->deleteByUserId($validToken->user_id);
        return true;
    }


    /**
     * Find a valid refresh token for the user.
     *
     * @param  $user
     * @param string $refreshToken
     * @return RefreshToken|null
     */
    private function findValidToken( $user, string $refreshToken): RefreshToken|null
    {
        $refreshTokens =  $this->refreshRepo->findByUserId($user->id);
        if (empty($refreshTokens)) return null;
        return $refreshTokens->first(fn($item) =>$item->isValidToken($refreshToken));
    }

    /**
     * Get the authenticated user's profile.
     *
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function getUserProfile(): \Illuminate\Contracts\Auth\Authenticatable|null
    {
        return $this->guard()->user();
    }

    /**
     * Handle forgot password request by sending a reset link to the user's email.
     *
     * @param string $email
     * @return bool
     */
    public function forgotPassword(string $email): bool
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
    public function verifyForgotPasswordToken(array $credentials): ForgotPasswordToken
    {
        $token = $credentials['forgot_password_token'];
        $validToken = $this->forgotPasswordTokenRepo->findByToken($token);
        if (empty($validToken)) {
            throw new BadRequestException('Invalid token');
        }
        if ($validToken->isExpired()) {
            throw new BadRequestException('Token has expired');
        }
        return $validToken;
    }

    /**
     * Handle reset password request by resetting the user's password.
     *
     * @param array $credentials
     * @return bool
     */
    public function resetPassword(array $credentials): bool
    {
        $validToken= $this->verifyForgotPasswordToken($credentials);
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
    private function createRefreshToken( $user): string
    {
        $refreshToken = Str::random((int)config('jwt.refresh_token_length', 64));
        $this->refreshRepo->create(
            [
                'user_id' => $user->id,
                'token' =>$refreshToken,
                'expires_at' => now()->addMinutes((int)config('jwt.refresh_ttl', 20160))
            ]
        );
        return $refreshToken;
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
