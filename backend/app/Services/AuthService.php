<?php

namespace App\Services;

use App\Enums\User\UserVerifyStatusEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\UnauthorizedException;
use App\Mail\ForgotPasswordMail;
use App\Mail\VerifyUserEmail;
use App\Mail\VerifyUserSuccess;
use App\Models\User;
use App\Repositories\ForgotPasswordTokenRepository;
use App\Repositories\RefreshTokenRepository;
use App\Repositories\UserRepository;
use App\Repositories\VerifyEmailTokenRepository;
use App\Traits\HasAuthUser;
use App\Services\TokenService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
class AuthService
{
    use HasAuthUser;

    /**
     * AuthService constructor.
     */
    public function __construct(
        private readonly UserRepository $userRepo,
        private readonly RefreshTokenRepository $refreshRepo,
        private readonly ForgotPasswordTokenRepository $forgotPasswordTokenRepo,
        private readonly VerifyEmailTokenRepository $verifyEmailTokenRepo,
        private readonly TokenService $tokenService,
        private readonly NotificationService $notificationService
    ) {}


    /**
     * Attempt to log the user in and return the access token and refresh token.
     *
     * @param array $credentials
     * @return array
     */
    public function login(array $credentials): array
    {
        if (!$this->guard()->attempt($credentials)) {
            throw new UnauthorizedException('Email or password is incorrect');
        }
        $user = $this->guard()->user();
        $accessToken = $this->tokenService->createAccessToken($user);
        $refreshToken = $this->tokenService->createRefreshToken($user);

        $this->notificationService->notifyAuthEvent($user->id, 'login');

        return [
            'access_token' => $accessToken,
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
        $token = $this->tokenService->verifyRefreshToken($refreshToken);
        $this->guard()->logout();
        $this->refreshRepo->delete($token->id); // @phpstan-ignore-line
        return true;
    }

    /**
     * Log the user out from all devices by invalidating all refresh tokens.
     * @param string $refreshToken
     * @return bool
     */
    public function logoutAll(string $refreshToken): bool
    {
        $this->tokenService->verifyRefreshToken($refreshToken);
        $user = $this->guard()->user();
        $this->guard()->logout();
        $this->refreshRepo->deleteByUserId($user->id);
        return true;
    }

    /**
     * Refresh the access token using the refresh token.
     *
     * @param string $refreshToken
     * @return array
     */
    public function refresh(string $refreshToken): array
    {
        $token = $this->tokenService->verifyRefreshToken($refreshToken);
        $user = $this->userRepo->findOrFail($token->user_id);

        $this->refreshRepo->delete($token->id); // @phpstan-ignore-line
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
        DB::transaction(function ()use ($data, &$accessToken, &$refreshToken, &$user) {
            $user = $this->userRepo->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'date_of_birth' => $data['date_of_birth'],
            ]);
            $accessToken = $this->tokenService->createAccessToken($user);
            $refreshToken = $this->tokenService->createRefreshToken($user);
            $verifyToken = $this->tokenService->createVerifyEmailToken($user);
            Mail::to($data['email'])->send(new VerifyUserEmail($user, $verifyToken));

            $this->notificationService->notifyAuthEvent($user->id, 'register');
        });

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'user' => $user
        ];
    }

    /**
     * Handle verify email request by verifying the token and activating the user's account.
     *
     * @param array $credentials
     *              - email_verify_token: The token sent to the user's email for verification.
     * @return bool
     */
    public function verifyEmail(array $credentials): array
    {
        $token = $credentials['email_verify_token'];
        $validToken = $this->tokenService->verifyVerifyEmailToken($token);
        $user = null;

        DB::transaction(function () use ($validToken, &$user) {
            $user = $this->userRepo->findOrFail($validToken->user_id);
            $user->verify = UserVerifyStatusEnum::VERIFIED->value;
            $user->save();
            $this->verifyEmailTokenRepo->deleteByUserId($validToken->user_id);
            Mail::to($user->email)->send(new VerifyUserSuccess($user));
        });

        return [
            'access_token' => $this->tokenService->createAccessToken($user),
            'refresh_token' => $this->tokenService->createRefreshToken($user),
            'user' => $user,
        ];
    }

    /**
     * Resend the verification email to the user if their email is not verified.
     *
     * @return bool
     */
    public function resendVerifyEmail(): bool
    {
        $user = $this->guard()->user();
        if ($user->verify === UserVerifyStatusEnum::VERIFIED->value) {
            throw new BusinessException('Email is already verified');
        }
        DB::transaction(function () use ($user) {
            $this->verifyEmailTokenRepo->deleteByUserId($user->id);
            $verifyToken = $this->tokenService->createVerifyEmailToken($user);
            Mail::to($user->email)->send(new VerifyUserEmail($user, $verifyToken));
        });
        return true;
    }

    /**
     * Get the authenticated user's profile.
     *
     * @return User|null
     */
    public function me(): User|null
    {
        return $this->guard()->user();
    }

    /**
     * Handle forgot password request by sending a reset link to the user's email.
     *
     * @param string $email
     * @return bool
     */
    public function forgot(string $email): bool
    {
        $user = $this->userRepo->findByEmail($email);
        if (!$user) {
            throw new BusinessException(
                'Email not found',
                ['email' => 'The email address is not registered. Please check and try again.']
            );
        }

        DB::transaction(function () use ($user, $email) {
            $token = $this->tokenService->createForgotPasswordToken($user);
            Mail::to($email)->send(new ForgotPasswordMail($user,$token));
        });

        return true;
    }

    /**
     * Handle verify forgot password token request by verifying the token and allowing the user to reset the password.
     *
     * @param array $credentials
     *              - forgot_password_token: The token sent to the user's email for password reset verification.
     * @return bool
     */
    public function verifyForgotToken(array $credentials): bool
    {
        $token = $credentials['forgot_password_token'];
        $this->tokenService->verifyForgotToken($token);
        return true;
    }

    /**
     * Handle reset password request by resetting the user's password.
     *
     * @param array $credentials
     * @return bool
     */
    public function resetPassword(array $credentials): bool
    {
        $validToken= $this->tokenService->verifyForgotToken($credentials['forgot_password_token']);
        $this->forgotPasswordTokenRepo->deleteByUserId($validToken->user_id);
        $user = $this->userRepo->findOrFail($validToken->user_id);
        $user->password = $credentials['password'];
        $user->save();
        return true;
    }
}
