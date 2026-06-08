<?php

namespace App\Services\Auth;

use App\Enums\Notification\NotificationAuthEventEnum;
use App\Enums\User\UserVerifyStatusEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\UnauthorizedException;
use App\Mail\ForgotPasswordMail;
use App\Services\Notification\NotificationService;
use App\Mail\VerifyUserMail;
use App\Mail\VerifyUserSuccess;
use App\Models\User;
use App\Repositories\ForgotPasswordTokenRepository;
use App\Repositories\RefreshTokenRepository;
use App\Repositories\UserRepository;
use App\Repositories\VerifyEmailTokenRepository;
use App\Traits\HasAuthUser;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class AuthService
{
    use HasAuthUser;

    /**
     * Create a new service instance.
     *
     * @param  UserRepository  $userRepository
     * @param  RefreshTokenRepository  $refreshTokenRepository
     * @param  ForgotPasswordTokenRepository  $forgotPasswordTokenRepository
     * @param  VerifyEmailTokenRepository  $verifyEmailTokenRepository
     * @param  AuthTokenService  $tokenService
     * @param  NotificationService  $notificationService
     */
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly RefreshTokenRepository $refreshTokenRepository,
        private readonly ForgotPasswordTokenRepository $forgotPasswordTokenRepository,
        private readonly VerifyEmailTokenRepository $verifyEmailTokenRepository,
        private readonly AuthTokenService $tokenService,
        private readonly NotificationService $notificationService
    ) {}

    /**
     * Attempt to log the user in and return the access token and refresh token.
     * @param  array{email: string, password: string}  $credentials
     * @return array{access_token: string, refresh_token: string, user: User}
     * @throws UnauthorizedException
     */
    public function login(array $credentials): array
    {
        if (! $this->guard()->attempt($credentials)) {
            throw new UnauthorizedException('Email or password is incorrect');
        }
        $user = $this->guard()->user();
        $accessToken = $this->tokenService->createAccessToken($user);
        $refreshToken = $this->tokenService->createRefreshToken($user);

        $this->notificationService->notifyAuthEvent($user->id, NotificationAuthEventEnum::LOGIN);

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => $user,
        ];
    }

    /**
     * Log the user out by invalidating the refresh token.
     *
     * @param  string  $refreshToken
     * @throws UnauthorizedException
     */
    public function logout(string $refreshToken): bool
    {
        $token = $this->tokenService->verifyRefreshToken($refreshToken);
        $this->guard()->logout();
        $this->refreshTokenRepository->delete($token->id); // @phpstan-ignore-line

        return true;
    }

    /**
     * Log the user out from all devices by invalidating all refresh tokens.
     *
     * @param  string  $refreshToken
     * @throws UnauthorizedException
     */
    public function logoutAll(string $refreshToken): bool
    {
        $this->tokenService->verifyRefreshToken($refreshToken);
        $user = $this->guard()->user();
        $this->guard()->logout();
        $this->refreshTokenRepository->deleteByUserId($user->id);

        return true;
    }

    /**
     * Refresh the access token using the refresh token.
     *
     * @param  string  $refreshToken
     * @return array{access_token: string, refresh_token: string, user: User}
     * @throws UnauthorizedException
     */
    public function refresh(string $refreshToken): array
    {
        $token = $this->tokenService->verifyRefreshToken($refreshToken);
        $user = $this->userRepository->findOrFail($token->user_id);

        $this->refreshTokenRepository->delete($token->id); // @phpstan-ignore-line
        $newAccessToken = $this->tokenService->createAccessToken($user);
        $newRefreshToken = $this->tokenService->createRefreshToken($user);

        return [
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken,
            'user' => $user,
        ];
    }

    /**
     * Register for new User
     * @param  array{name: string, email: string, password: string, date_of_birth: string}  $data
     * @return array{access_token: string, refresh_token: string, user: User}
     * @throws BusinessException
     */
    public function register(array $data): array
    {
        $isExist = $this->userRepository->isExistByEmail($data['email']);
        if ($isExist) {
            throw new BusinessException(
                'Email already exists',
                ['email' => 'The email address is already registered. Please use a different email.']
            );
        }
        DB::transaction(function () use ($data, &$accessToken, &$refreshToken, &$user) {
            $user = $this->userRepository->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'date_of_birth' => $data['date_of_birth'],
            ]);
            $accessToken = $this->tokenService->createAccessToken($user);
            $refreshToken = $this->tokenService->createRefreshToken($user);
            $verifyToken = $this->tokenService->createVerifyEmailToken($user);
            Mail::to($data['email'])->send(new VerifyUserMail($user, $verifyToken));

            $this->notificationService->notifyAuthEvent($user->id, NotificationAuthEventEnum::REGISTER);
        });

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => $user,
        ];
    }

    /**
     * Handle verify email request by verifying the token and activating the user's account.
     * @param  array{email_verify_token: string}  $credentials
     * @return array{access_token: string, refresh_token: string, user: User}
     * @throws \App\Exceptions\http\BadRequestException
     */
    public function verifyEmail(array $credentials): array
    {
        $token = $credentials['email_verify_token'];
        $validToken = $this->tokenService->verifyVerifyEmailToken($token);
        return DB::transaction(function () use ($validToken) {
            $user = $this->userRepository->findOrFail($validToken->user_id);
            $user->verify = UserVerifyStatusEnum::VERIFIED->value;
            $user->save();
            $this->verifyEmailTokenRepository->deleteByUserId($validToken->user_id);
            Mail::to($user->email)->send(new VerifyUserSuccess($user));

            return [
                'access_token' => $this->tokenService->createAccessToken($user),
                'refresh_token' => $this->tokenService->createRefreshToken($user),
                'user' => $user,
            ];
        });
    }

    /**
     * Resend the verification email to the user if their email is not verified.
     * @throws BusinessException
     */
    public function resendVerifyEmail(): bool
    {
        $user = $this->guard()->user();
        if ($user->verify === UserVerifyStatusEnum::VERIFIED->value) {
            throw new BusinessException('Email is already verified');
        }
        DB::transaction(function () use ($user) {
            $this->verifyEmailTokenRepository->deleteByUserId($user->id);
            $verifyToken = $this->tokenService->createVerifyEmailToken($user);
            Mail::to($user->email)->send(new VerifyUserMail($user, $verifyToken));
        });

        return true;
    }

    /**
     * Get the authenticated user's profile.
     * Requires auth middleware to have run — guard always resolves to a User.
     */
    public function me(): User
    {
        /** @var User $user */
        $user = $this->guard()->user();

        return $user;
    }

    /**
     * Handle forgot password request by sending a reset link to the user's email.
     * @throws BusinessException
     */
    public function forgot(string $email): bool
    {
        $user = $this->userRepository->findByEmail($email);

        // Always return success to prevent account enumeration.
        // Email is sent only if the account actually exists.
        if (! $user) {
            return true;
        }

        DB::transaction(function () use ($user, $email) {
            $token = $this->tokenService->createForgotPasswordToken($user);
            Mail::to($email)->send(new ForgotPasswordMail($user, $token));
        });

        return true;
    }

    /**
     * Verify that a forgot-password token is valid.
     * @param  array{forgot_password_token: string}  $credentials
     * @throws \App\Exceptions\http\BadRequestException
     */
    public function verifyForgotPasswordToken(array $credentials): bool
    {
        $token = $credentials['forgot_password_token'];
        $this->tokenService->verifyForgotPasswordToken($token);

        return true;
    }

    /**
     * Handle reset password request by resetting the user's password.
     * @param  array{forgot_password_token: string, password: string}  $credentials
     * @throws \App\Exceptions\http\BadRequestException
     */
    public function resetPassword(array $credentials): bool
    {
        $validToken = $this->tokenService->verifyForgotPasswordToken($credentials['forgot_password_token']);
        $this->forgotPasswordTokenRepository->deleteByUserId($validToken->user_id);
        $user = $this->userRepository->findOrFail($validToken->user_id);
        $user->password = $credentials['password'];
        $user->save();

        return true;
    }
}
