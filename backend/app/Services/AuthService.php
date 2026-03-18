<?php

namespace App\Services;

use App\Exceptions\http\BusinessException;
use App\Exceptions\http\UnauthorizedException;
use App\Mail\ForgotPasswordMail;
use App\Models\RefreshToken;
use App\Repositories\ForgotPasswordTokenRepository;
use App\Repositories\RefreshTokenRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    /**
     * AuthService constructor.
     */
    public function __construct(
        private UserRepository $userRepo,
        private RefreshTokenRepository $refreshRepo,
        private ForgotPasswordTokenRepository $forgotPasswordTokenRepo
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
        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => $user
        ];
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
        return $refreshTokens->first(fn($item) => Hash::check($refreshToken, $item->token));
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
     * Get the guard to be used during authentication.
     *
     * @return \Tymon\JWTAuth\JWTGuard
     */
    private function guard()
    {
        // @phpstan-ignore return.type
        return Auth::guard('api');
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
                'token' => Hash::make($refreshToken),
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
                'token' => Hash::make($token),
                'expires_at' => now()->addMinutes((int)config('auth.reset_password.expire', 60))
            ]
        );
        return $token;
    }
}