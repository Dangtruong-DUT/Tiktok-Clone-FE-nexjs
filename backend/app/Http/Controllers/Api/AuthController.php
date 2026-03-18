<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LogoutRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyForgotPasswordTokenRequest;
use App\Http\Resources\Api\Auth\AuthResource;
use App\Http\Response\ApiResponse;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
    ) {}

    /**
     * Handle a registration request for the application.
     *
     * @param RegisterRequest $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $registerResult = $this->authService->register($credentials);
        return $this->respondWithToken($registerResult['access_token'], $registerResult['refresh_token'], 'Registration successful');
    }

    /**
     * Handle a login request to the application.
     *
     * @param LoginRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse{
        $credentials = $request->validated();
        $loginResult = $this->authService->login($credentials);
        return $this->respondWithToken($loginResult['access_token'], $loginResult['refresh_token']);
    }

    /**
     * Get the authenticated User
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(): JsonResponse
    {
        $user = $this->authService->getUserProfile();
        return ApiResponse::success(
            new AuthResource($user),
            'User retrieved successfully'
        );
    }

    /**
     * Log the user out (Invalidate the token)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(LogoutRequest $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token');
        $this->authService->logout($refreshToken);
        return ApiResponse::success(message: 'Successfully logged out');
    }

    /**
    * Log the user out from all devices (Invalidate all tokens)
    *
    * @return \Illuminate\Http\JsonResponse
    */
    public function logoutAll(): JsonResponse
    {
        $this->authService->logoutAll();
        return ApiResponse::success(message: 'Successfully logged out from all devices');
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token');
        $newAccessToken = $this->authService->refresh($refreshToken);
        return $this->respondWithToken($newAccessToken, $refreshToken, 'Token refreshed successfully');
    }

    /**
     * Handle forgot password request by sending a reset link to the user's email.
     *
     * @param ForgotPasswordRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->forgotPassword($request->input('email'));
        return ApiResponse::success(message: 'forgot password validation email sent successfully');
    }

    /**
     * Handle verify forgot password request by verifying the token and resetting the password.
     *
     * @param VerifyForgotPasswordTokenRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyForgotPasswordToken(VerifyForgotPasswordTokenRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $this->authService->verifyForgotPasswordToken($credentials);
        return ApiResponse::success(message: 'Password has been reset successfully');
    }

    /**
    * Handle reset password request by resetting the user's password.
    * @param ResetPasswordRequest $request
    * @return \Illuminate\Http\JsonResponse
    */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $this->authService->resetPassword($credentials);
        return ApiResponse::success(message: 'Password has been reset successfully');
    }

    /**
     * Get the token array structure.
     *
     * @param string $accessToken
     * @param string|null $refreshToken
     * @param string $message
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken(
        string $accessToken,
        ?string $refreshToken=null,
        string $message = 'Login successful'
    ): JsonResponse
    {
        $user = $this->authService->getUserProfile();

        return ApiResponse::success([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            "user"=>new AuthResource($user),
        ],$message);
    }

}