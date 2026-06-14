<?php

namespace App\Http\Controllers\Api\Auth;

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
use App\Services\Auth\AuthService;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  AuthService  $authService
     */
    public function __construct(
        private readonly AuthService $authService
    ) {}

    /**
     * Handle a registration request for the application.
     * @param  RegisterRequest  $request
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $registerResult = $this->authService->register($credentials);

        return $this->respondWithToken(
            $registerResult['access_token'],
            $registerResult['refresh_token'],
            trans('messages.auth.registered'),
            $registerResult['user']
        );
    }

    /**
     * Handle a login request to the application.
     * @param  LoginRequest  $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $loginResult = $this->authService->login($credentials);

        return $this->respondWithToken(
            $loginResult['access_token'],
            $loginResult['refresh_token'],
            trans('messages.auth.logged_in'),
            $loginResult['user']
        );
    }

    /**
     * Get the authenticated User
     * @return JsonResponse
     */
    public function me(): JsonResponse
    {
        $user = $this->authService->me();

        return ApiResponse::success(
            data:    new AuthResource($user),
            message: trans('messages.auth.user_retrieved'),
        );
    }

    /**
     * Log the user out (Invalidate the token)
     * @param  LogoutRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function logout(LogoutRequest $request): \Illuminate\Http\Response
    {
        $refreshToken = $request->input('refresh_token') ?? $request->cookie('refresh_token');
        $this->authService->logout($refreshToken);

        return ApiResponse::noContent();
    }

    /**
     * Log the user out from all devices (Invalidate all tokens)
     * @param  LogoutRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function logoutAll(LogoutRequest $request): \Illuminate\Http\Response
    {
        $refreshToken = $request->input('refresh_token');
        $this->authService->logoutAll($refreshToken);

        return ApiResponse::noContent();
    }

    /**
     * Refresh a token.
     * @param  RefreshTokenRequest  $request
     * @return JsonResponse
     */
    public function refresh(RefreshTokenRequest $request): JsonResponse
    {
        $refreshToken = $request->input('refresh_token');
        $result = $this->authService->refresh($refreshToken);

        return $this->respondWithToken(
            $result['access_token'],
            $result['refresh_token'],
            trans('messages.auth.token_refreshed'),
            $result['user']
        );
    }

    /**
     * Handle forgot password request by sending a reset link to the user's email.
     * @param  ForgotPasswordRequest  $request
     * @return JsonResponse
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->forgot($request->input('email'));

        return ApiResponse::success(message: trans('messages.auth.forgot_email_sent'));
    }

    /**
     * Handle verify forgot password request by verifying the token and resetting the password.
     * @param  VerifyForgotPasswordTokenRequest  $request
     * @return JsonResponse
     */
    public function verifyForgotPasswordToken(VerifyForgotPasswordTokenRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $this->authService->verifyForgotPasswordToken($credentials);

        return ApiResponse::success(message: trans('messages.auth.token_verified'));
    }

    /**
     * Handle reset password request by resetting the user's password.
     * @param  ResetPasswordRequest  $request
     * @return JsonResponse
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $this->authService->resetPassword($credentials);

        return ApiResponse::success(message: trans('messages.auth.password_reset'));
    }

    /**
     * Handle verify email request by verifying the token and activating the user's account.
     * @param  VerifyEmailRequest  $request
     * @return JsonResponse
     */
    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        $credentials = $request->validated();
        $result = $this->authService->verifyEmail($credentials);

        return $this->respondWithToken(
            $result['access_token'],
            $result['refresh_token'],
            trans('messages.auth.email_verified'),
            $result['user']
        );
    }

    /**
     * Resend the verification email to the user if their email is not verified.
     * @return JsonResponse
     */
    public function resendVerifyEmail(): JsonResponse
    {
        $this->authService->resendVerifyEmail();

        return ApiResponse::success(message: trans('messages.auth.email_resent'));
    }

    /**
     * Build the authentication response payload.
     *
     * @param  string  $accessToken
     * @param  string|null  $refreshToken
     * @param  string  $message
     * @param  Authenticatable  $user
     * @return JsonResponse
     */
    protected function respondWithToken(
        string $accessToken,
        ?string $refreshToken,
        string $message,
        Authenticatable $user,
    ): JsonResponse {
        return ApiResponse::success(
            data: [
                'access_token'  => $accessToken,
                'refresh_token' => $refreshToken,
                'user'          => $user ? new AuthResource($user) : null,
            ],
            message: $message,
        );
    }
}
