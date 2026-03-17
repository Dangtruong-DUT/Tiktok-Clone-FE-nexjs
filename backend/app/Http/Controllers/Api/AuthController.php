<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LogoutRequest;
use App\Http\Resources\Api\Auth\AuthResource;
use App\Http\Response\ApiResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller implements HasMiddleware
{


    public static function middleware(): array
    {
        return [
            new Middleware('auth:api', except: ['login']),
        ];
    }


    public function login(LoginRequest $request) {
        $credentials = $request->validated();
        if (!$token = $this->guard()->attempt($credentials))
        {
            return ApiResponse::error('Invalid credentials', Response::HTTP_UNAUTHORIZED);
        }

        $refreshToken = Str::random(config('jwt.refresh_token_length'));
        $user = $this->guard()->user();
        $user->refreshTokens()->create([
            'token' => Hash::make($refreshToken),
            'expires_at' => now()->addMinutes(config('jwt.refresh_ttl')),
        ]);
        return $this->respondWithToken($token, $refreshToken);
    }

    /**
     * Get the authenticated User
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return ApiResponse::success(
            new AuthResource($this->guard()->user()),
            'User retrieved successfully'
        );
    }

    /**
     * Log the user out (Invalidate the token)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(LogoutRequest $request)
    {
        $refreshToken = $request->input('refresh_token');
        $user = $this->guard()->user();
        $token = $user->refreshTokens()
            ->get()
            ->first(fn($item) => Hash::check($refreshToken, $item->token));

        if (!$token) {
            return ApiResponse::error('Invalid token', Response::HTTP_UNAUTHORIZED);
        }
        $token->delete();
        return ApiResponse::success(message: 'Successfully logged out');
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(RefreshTokenRequest $request)
    {
        $refreshToken = $request->input('refresh_token');
        $user = $this->guard()->user();
        $token = $user->refreshTokens()
            ->get()
            ->first(fn($item) => Hash::check($refreshToken, $item->token));

        if (!$token) {
            return ApiResponse::error('Invalid token', Response::HTTP_UNAUTHORIZED);
        }

        $newAccessToken = $this->guard()->refresh();
        return $this->respondWithToken($newAccessToken, $refreshToken, 'Token refreshed successfully');
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


    /**
     * Get the token array structure.
     *
     * @param string $accessToken
     * @param string|null $refreshToken
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken(string $accessToken, ?string $refreshToken=null, string $message = 'Login successful')
    {
        $user = $this->guard()->user();

        return ApiResponse::success([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            "user"=>new AuthResource($user),
            'token_type' => 'bearer',
        ],$message);
    }

}