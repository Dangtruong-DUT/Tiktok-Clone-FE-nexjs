<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\LogoutRequest;
use App\Http\Requests\Auth\RefreshTokenRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Requests\Auth\VerifyForgotPasswordTokenRequest;
use App\Http\Resources\Api\Auth\AuthResource;
use App\Http\Response\ApiResponse;
use App\Services\AuthService;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    /**
     * Handle a registration request for the application.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $registerResult = $this->authService->register($credentials);

        return $this->respondWithToken(
            $registerResult['access_token'],
            $registerResult['refresh_token'],
            'Registration successful',
            $registerResult['user']
        );
    }

    /**
     * Handle a login request to the application.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $loginResult = $this->authService->login($credentials);

        return $this->respondWithToken(
            $loginResult['access_token'],
            $loginResult['refresh_token'],
            'Login successful',
            $loginResult['user']
        );
    }

    /**
     * Get the authenticated User
     */
    public function me(): JsonResponse
    {
        $user = $this->authService->me();

        return ApiResponse::success(
            new AuthResource($user),
            'User retrieved successfully'
        );
    }

    /**
     * Log the user out (Invalidate the token)
     */
    public function logout(LogoutRequest $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token');
        $this->authService->logout($refreshToken);

        return ApiResponse::success(message: 'Successfully logged out');
    }

    /**
     * Log the user out from all devices (Invalidate all tokens)
     */
    public function logoutAll(LogoutRequest $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token');
        $this->authService->logoutAll($refreshToken);

        return ApiResponse::success(message: 'Successfully logged out from all devices');
    }

    /**
     * Refresh a token.
     */
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token');
        $result = $this->authService->refresh($refreshToken);

        return $this->respondWithToken(
            $result['access_token'],
            $result['refresh_token'],
            'Token refreshed successfully',
            $result['user']
        );
    }

    /**
     * Handle forgot password request by sending a reset link to the user's email.
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->forgot($request->input('email'));

        return ApiResponse::success(message: 'Forgot password validation email sent successfully');
    }

    /**
     * Handle verify forgot password request by verifying the token and resetting the password.
     */
    public function verifyForgotPasswordToken(VerifyForgotPasswordTokenRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $this->authService->verifyForgotToken($credentials);

        return ApiResponse::success(message: 'forgot password validation email sent successfully');
    }

    /**
     * Handle reset password request by resetting the user's password.
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $this->authService->resetPassword($credentials);

        return ApiResponse::success(message: 'Password has been reset successfully');
    }

    /**
     * Handle verify email request by verifying the token and activating the user's account.
     */
    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $result = $this->authService->verifyEmail($credentials);

        return $this->respondWithToken(
            $result['access_token'],
            $result['refresh_token'],
            'Email has been verified successfully',
            $result['user']
        );
    }

    /**
     * Resend the verification email to the user if their email is not verified.
     */
    public function resendVerifyEmail(Request $request): JsonResponse
    {
        $this->authService->resendVerifyEmail();

        return ApiResponse::success(message: 'Verification email resent successfully');
    }

    /**
     * Get the token array structure.
     */
    protected function respondWithToken(
        string $accessToken,
        ?string $refreshToken = null,
        string $message = 'Login successful',
        ?Authenticatable $user = null
    ): JsonResponse {
        $userData = $user ?? $this->authService->me();

        return ApiResponse::success([
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => $userData ? new AuthResource($userData) : null,
        ], $message);
    }
}
