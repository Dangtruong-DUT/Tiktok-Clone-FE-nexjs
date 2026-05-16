<?php

namespace App\Services;

use App\Enums\Auth\TokenTypeEnum;
use App\Exceptions\http\BadRequestException;
use App\Exceptions\http\UnauthorizedException;
use App\Models\EmailVerifyToken;
use App\Models\ForgotPasswordToken;
use App\Models\RefreshToken;
use App\Models\User;
use App\Repositories\ForgotPasswordTokenRepository;
use App\Repositories\RefreshTokenRepository;
use App\Repositories\VerifyEmailTokenRepository;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthTokenService
{
    public function __construct(
        private readonly RefreshTokenRepository $refreshTokenRepository,
        private readonly ForgotPasswordTokenRepository $forgotPasswordTokenRepository,
        private readonly VerifyEmailTokenRepository $verifyEmailTokenRepository
    ) {}

    /**
     * Verify email verification token.
     * @param string $verifyEmailToken The plain email verification token to verify.
     * @return EmailVerifyToken The valid email verification token model instance.
     */
    public function verifyVerifyEmailToken(string $verifyEmailToken): EmailVerifyToken
    {
        $fingerprint = EmailVerifyToken::hashToken($verifyEmailToken);

        $validToken = $this->verifyEmailTokenRepository
            ->findByTokenHash($fingerprint);

        if (! $validToken) {
            throw new BadRequestException('Invalid token');
        }

        if ($validToken->isExpired()) {
            $this->verifyEmailTokenRepository->delete($validToken->id);

            throw new BadRequestException('Token has expired');
        }

        return $validToken;
    }

    /**
     * Verify forgot password token.
     * @param string $forgotPasswordToken The plain forgot password token to verify.
     * @return ForgotPasswordToken The valid forgot password token model instance.
     */
    public function verifyForgotPasswordToken(
        string $forgotPasswordToken
    ): ForgotPasswordToken {
        $fingerprint = ForgotPasswordToken::hashToken(
            $forgotPasswordToken
        );

        $validToken = $this->forgotPasswordTokenRepository
            ->findByTokenHash($fingerprint);

        if (! $validToken) {
            throw new BadRequestException('Invalid token');
        }

        if ($validToken->isExpired()) {
            $this->forgotPasswordTokenRepository->delete($validToken->id);

            throw new BadRequestException('Token has expired');
        }

        return $validToken;
    }

    /**
     * Verify refresh token.
     * @param string $refreshToken The plain refresh token to verify.
     * @return RefreshToken The valid refresh token model instance.
     */
    public function verifyRefreshToken(
        string $refreshToken
    ): RefreshToken {
        try {
            $payload = JWTAuth::setToken($refreshToken)->getPayload();
        } catch (JWTException $exception) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        $tokenType = (int) ($payload->get('token_type') ?? -1);

        if ($tokenType !== TokenTypeEnum::REFRESH->value) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        $token = $this->refreshTokenRepository->findByJti(
            $payload->get('jti')
        );

        if (! $token) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        $sub = (int) $payload->get('sub');

        if ($sub !== $token->user_id) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if ($token->isExpired()) {
            $this->refreshTokenRepository->delete($token->id);

            throw new UnauthorizedException(
                'Refresh token has expired'
            );
        }

        return $token;
    }

    /**
     * Create refresh token.
     * @param User $user The user for whom the refresh token is being created.
     * @return string The generated refresh token.
     */
    public function createRefreshToken(User $user): string
    {
        JWTAuth::factory()->setTTL(
            (int) config('jwt.refresh_ttl', 20160)
        );

        $claims = $user->getJWTCustomClaims(
            TokenTypeEnum::REFRESH->value
        );

        $refreshToken = JWTAuth::claims($claims)->fromUser($user);

        $this->refreshTokenRepository->create([
            'jti' => $claims['jti'],
            'user_id' => $user->id,
            'expires_at' => now()->addMinutes(
                (int) config('jwt.refresh_ttl', 20160)
            ),
        ]);

        return $refreshToken;
    }

    /**
     * Create access token.
     * @param User $user The user for whom the access token is being created.
     * @return string The generated access token.
     */
    public function createAccessToken(User $user): string
    {
        JWTAuth::factory()->setTTL(
            (int) config('jwt.ttl', 60)
        );

        $claims = $user->getJWTCustomClaims(
            TokenTypeEnum::ACCESS->value
        );

        return JWTAuth::claims($claims)->fromUser($user);
    }

    /**
     * Create forgot password token.
     * @param User $user The user for whom the forgot password token is being created.
     * @return string The generated forgot password token.
     */
    public function createForgotPasswordToken(User $user): string
    {
        $token = ForgotPasswordToken::generatePlainToken(
            (int) config('auth.reset_password.token_length', 64)
        );

        $this->forgotPasswordTokenRepository->create([
            'token_hash' => ForgotPasswordToken::hashToken($token),
            'user_id' => $user->id,
            'expires_at' => now()->addMinutes(
                (int) config('auth.reset_password.expire', 60)
            ),
        ]);

        return $token;
    }

    /**
     * Create verify email token.
     * @param User $user The user for whom the email verification token is being created.
     * @return string The generated email verification token.
     */
    public function createVerifyEmailToken(User $user): string
    {
        $token = EmailVerifyToken::generatePlainToken(
            (int) config('auth.verification.token_length', 64)
        );

        $this->verifyEmailTokenRepository->create([
            'token_hash' => EmailVerifyToken::hashToken($token),
            'user_id' => $user->id,
            'expires_at' => now()->addMinutes(
                (int) config('auth.verification.expire', 60)
            ),
        ]);

        return $token;
    }
}
