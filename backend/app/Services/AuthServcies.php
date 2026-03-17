<?php

namespace App\Services;

use App\Repositories\UserRepository;
use Auth;
use Hash;
use RefreshTokenRepository;
use Str;

class AuthService
{
    public function __construct(
        private UserRepository $userRepo,
        private RefreshTokenRepository $refreshRepo
    ) {}

    public function login(array $credentials)
    {
        if (!$token = $this->guard()->attempt($credentials)) {
            return null;
        }

        $user = $this->guard()->user();

        $refreshToken = Str::random(config('jwt.refresh_token_length'));

        $this->refreshRepo->create(
            [
                'user_id' => $user->id,
                'token' => Hash::make($refreshToken),
                'expires_at' => now()->addMinutes(config('jwt.refresh_ttl'))
            ]
        );

        return [
            'access_token' => $token,
            'refresh_token' => $refreshToken,
            'user' => $user
        ];
    }

    public function logout($user, $refreshToken)
    {
        $token = $this->findValidToken($user, $refreshToken);

        if (!$token) return false;

        $this->refreshRepo->delete($token);
        return true;
    }

    public function refresh($user, $refreshToken)
    {
        $token = $this->findValidToken($user, $refreshToken);

        if (!$token) return null;

        return $this->guard()->refresh();
    }



    private function findValidToken($user, $refreshToken)
    {
      $user=  $this->refreshRepo
            ->findByUser($user);

        if (!$user) return null;

        return $user->tokens()->first(fn($item) => Hash::check($refreshToken, $item->token));
    }


    /**
     * Get the guard to be used during authentication.
     *
     * @return \Tymon\JWTAuth\JWTGuard
     */
    public function guard()
    {
        // @phpstan-ignore return.type
        return Auth::guard('api');
    }
}