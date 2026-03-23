<?php
namespace App\Services;

use App\Enums\Auth\TokenTypeEnum;
use App\Exceptions\http\BadRequestException;
use App\Exceptions\http\UnauthorizedException;
use App\Models\EmailVerifyToken;
use App\Models\ForgotPasswordToken;
use App\Models\RefreshToken;
use App\Repositories\ForgotPasswordTokenRepository;
use App\Repositories\RefreshTokenRepository;
use App\Repositories\VerifyEmailTokenRepository;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;

class TokenService
{
    public function __construct(
        private readonly RefreshTokenRepository $refreshRepo,
        private readonly ForgotPasswordTokenRepository $forgotPasswordTokenRepo,
        private readonly VerifyEmailTokenRepository $verifyEmailTokenRepo
    ) {}

    /**
     * Handle verify email verification token by verifying the token and returning the associated user.
     *
     * @param string $verifyEmailToken
     * @return EmailVerifyToken
     */
    public function verifyVerifyEmailToken(string $verifyEmailToken): EmailVerifyToken
    {
        $fingerprint = hash('sha256', $verifyEmailToken);
        $validToken = $this->verifyEmailTokenRepo->findByTokenFingerprint($fingerprint);

        if (!$validToken||!$validToken->isValidToken($verifyEmailToken)) {
            throw new BadRequestException('Invalid token');
        }

        if ($validToken->isExpired()) {
            $this->verifyEmailTokenRepo->delete($validToken->id);
            throw new BadRequestException('Token has expired');
        }
        return $validToken;
    }


    /**
     * Handle verify forgot password request by verifying the token and resetting the password.
     *
     * @param string $forgotPasswordToken
     * @return ForgotPasswordToken
     */
    public function verifyForgotToken(string $forgotPasswordToken): ForgotPasswordToken
    {
        $fingerprint = hash('sha256', $forgotPasswordToken);
        $validToken = $this->forgotPasswordTokenRepo->findByTokenFingerprint($fingerprint);
        if (!$validToken||!$validToken->isValidToken($forgotPasswordToken)) {
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

        $token = $this->refreshRepo->findByJti($payload->get('jti'));
        if (!$token||!$token->isValidToken($refreshToken)) {
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
     * Create refreshtoken.
     * @param $user
     * @return string
     */
    public function createRefreshToken($user): string
    {
        JWTAuth::factory()->setTTL((int) config('jwt.refresh_ttl', 20160));
        $claims = $user->getJWTCustomClaims(TokenTypeEnum::REFRESH->value);
        $refreshToken = JWTAuth::claims($claims)->fromUser($user);

        $this->refreshRepo->create(
            [
                'jti' => $claims['jti'],
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
        $claims = $user->getJWTCustomClaims(TokenTypeEnum::ACCESS->value);
        return JWTAuth::claims($claims)->fromUser($user);
    }

    /**
     * Create forgot password token.
     * @param $user
     * @return string
     */
    public function createForgotPasswordToken($user): string
    {
        $token = Str::random((int)config('auth.reset_password.token_length', 64));
        $hashedToken = hash('sha256', $token);
        $this->forgotPasswordTokenRepo->create(
            [
                'token_fingerprint' => $hashedToken,
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
        $hashedToken = hash('sha256', $token);
        $this->verifyEmailTokenRepo->create(
            [
                'token_fingerprint' => $hashedToken,
                'user_id' => $user->id,
                'token' => $token,
                'expires_at' => now()->addMinutes((int)config('auth.verification.expire', 60))
            ]
        );
        return $token;
    }
}
