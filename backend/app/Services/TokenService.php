<?php

use App\Enums\Auth\TokenTypeEnum;
use App\Exceptions\http\BadRequestException;
use App\Exceptions\http\UnauthorizedException;
use App\Models\ForgotPasswordToken;
use App\Models\RefreshToken;
use App\Repositories\ForgotPasswordTokenRepository;
use App\Repositories\RefreshTokenRepository;
use App\Repositories\UserRepository;
use App\Repositories\VerifyEmailTokenRepository;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class TokenService
{
    public function __construct(
        private readonly UserRepository $userRepo,
        private readonly RefreshTokenRepository $refreshRepo,
        private readonly ForgotPasswordTokenRepository $forgotPasswordTokenRepo,
        private readonly VerifyEmailTokenRepository $verifyEmailTokenRepo
    ) {}

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

        $tokenType = (int) ($payload->get('token_Type') ?? -1);

        if ($tokenType !== TokenTypeEnum::REFRESH->value) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        $token = $this->refreshRepo->findByToken($refreshToken);
        if (!$token) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        $sub = (int)$payload->get('sub');

        if ($sub !== $token->user_id) {
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
    public function createRefreshToken($user): string
    {
        JWTAuth::factory()->setTTL((int) config('jwt.refresh_ttl', 20160));
        $refreshToken = JWTAuth::claims($user->getJWTCustomClaims(TokenTypeEnum::REFRESH->value))
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
    public function createAccessToken($user): string
    {
        JWTAuth::factory()->setTTL((int) config('jwt.ttl', 60));
        return JWTAuth::claims(
            $user->getJWTCustomClaims(TokenTypeEnum::ACCESS->value))
            ->fromUser($user);
    }

    /**
     * Create forgot password token.
     * @param $user
     * @return string
     */
    public function createForgotPasswordToken($user): string
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
