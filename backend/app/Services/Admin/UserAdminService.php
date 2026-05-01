<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Exceptions\http\BadRequestException;
use App\Mail\AdminDirectMessageMail;
use App\Models\User;
use App\Repositories\UserRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class UserAdminService
{
    use HasAuthUser;

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly AdminLogService $adminLogService,
        private readonly AdminModerationNoticeService $adminModerationNoticeService,
    ) {}

    /**
     * Get user details
     *
     * @param int $userId
     * @return User
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getUserDetail(int $userId): User
    {
        /** @var User $user */
        $user = $this->userRepository->findOrFail($userId);

        return $user;
    }

    /**
     * Ban a user account.
     *
     * @param array{user_uuid:string,reason:string,duration_days?:int} $payload
     * @return User Updated user
     * @throws \Exception
     */
    public function banUser(array $payload): User
    {
        $admin = $this->guard()->user();
        $user = $this->userRepository->findByUuidOrFail((string) $payload['user_uuid']);

        if ($admin->id === $user->id) {
            throw new BadRequestException('You cannot ban yourself');
        }

        if ($user->banned_at !== null) {
            throw new BadRequestException('User is already banned');
        }

        return DB::transaction(function () use ($admin, $user, $payload) {
            $oldData = $user->only(['banned_at', 'ban_reason', 'ban_duration_days']);

            $user->update([
                'banned_at' => now(),
                'ban_reason' => $payload['reason'],
                'ban_duration_days' => $payload['duration_days'] ?? null,
            ]);

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::USER,
                resourceId: $user->id,
                action: AdminActionEnum::BAN,
                reason: $payload['reason'],
                oldData: $oldData,
                newData: $user->only(['banned_at', 'ban_reason', 'ban_duration_days']),
            );

            $this->adminModerationNoticeService->send(
                admin: $admin,
                targetUser: $user,
                action: AdminActionEnum::BAN,
                reason: (string) $payload['reason'],
                entityType: ModelEntityTypeEnum::USER,
                entityId: $user->id,
                context: [
                    'resource_type' => ResourceTypeEnum::USER->value,
                    'resource_id' => $user->id,
                ]
            );

            return $user;
        });
    }

    /**
     * Unban a user account.
     *
     * @param array{user_uuid:string} $payload
     * @return User Updated user
     * @throws \Exception
     */
    public function unbanUser(array $payload): User
    {
        $admin = $this->guard()->user();
        $user = $this->userRepository->findByUuidOrFail((string) $payload['user_uuid']);

        if ($user->banned_at === null) {
            throw new BadRequestException('User is not banned');
        }

        return DB::transaction(function () use ($admin, $user) {
            $oldData = $user->only(['banned_at', 'ban_reason', 'ban_duration_days']);

            $user->update([
                'banned_at' => null,
                'ban_reason' => null,
                'ban_duration_days' => null,
            ]);

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::USER,
                resourceId: $user->id,
                action: AdminActionEnum::UNBAN,
                oldData: $oldData,
                newData: $user->only(['banned_at', 'ban_reason', 'ban_duration_days']),
            );

            $this->adminModerationNoticeService->send(
                admin: $admin,
                targetUser: $user,
                action: AdminActionEnum::UNBAN,
                reason: 'Your account ban has been removed by admin',
                entityType: ModelEntityTypeEnum::USER,
                entityId: $user->id,
                context: [
                    'resource_type' => ResourceTypeEnum::USER->value,
                    'resource_id' => $user->id,
                ]
            );

            return $user;
        });
    }

    /**
     * Delete a user account (soft delete).
     *
     * @param array{user_uuid:string,reason:string} $payload
     * @return void
     * @throws \Exception
     */
    public function deleteUser(array $payload): void
    {
        $admin = $this->guard()->user();
        $user = $this->userRepository->findByUuidOrFail((string) $payload['user_uuid']);

        if ($admin->id === $user->id) {
            throw new BadRequestException('You cannot delete yourself');
        }

        DB::transaction(function () use ($admin, $user, $payload) {
            $oldData = [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
            ];

            $user->delete();

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::USER,
                resourceId: $user->id,
                action: AdminActionEnum::DELETE_USER,
                reason: $payload['reason'],
                oldData: $oldData,
                newData: null,
            );

            $this->adminModerationNoticeService->send(
                admin: $admin,
                targetUser: $user,
                action: AdminActionEnum::DELETE_USER,
                reason: (string) $payload['reason'],
                entityType: ModelEntityTypeEnum::USER,
                entityId: $user->id,
                context: [
                    'resource_type' => ResourceTypeEnum::USER->value,
                    'resource_id' => $user->id,
                ]
            );
        });
    }

    /**
     * Reset a user password by admin.
     *
     * @param array{user_uuid:string,password:string} $payload
     * @return User
     */
    public function resetUserPassword(array $payload): User
    {
        $admin = $this->guard()->user();
        $user = $this->userRepository->findByUuidOrFail((string) $payload['user_uuid']);

        return DB::transaction(function () use ($admin, $user, $payload) {
            $user->password = (string) $payload['password'];
            $user->save();

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::USER,
                resourceId: $user->id,
                action: AdminActionEnum::RESET_USER_PASSWORD,
                reason: 'Admin reset user password',
                oldData: null,
                newData: null,
            );

            return $user;
        });
    }

    /**
     * Send direct mail from admin to target user.
     *
     * @param array{user_uuid:string,subject:string,message:string} $payload
     * @return void
     */
    public function sendMailToUser(array $payload): void
    {
        $admin = $this->guard()->user();
        $user = $this->userRepository->findByUuidOrFail((string) $payload['user_uuid']);

        if (!$user->email) {
            throw new BadRequestException('Target user does not have an email address');
        }

        DB::transaction(function () use ($admin, $user, $payload) {
            Mail::to($user->email)->send(new AdminDirectMessageMail(
                admin: $admin,
                targetUser: $user,
                subjectLine: (string) $payload['subject'],
                messageBody: (string) $payload['message'],
            ));

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::USER,
                resourceId: $user->id,
                action: AdminActionEnum::SEND_EMAIL_TO_USER,
                reason: (string) $payload['subject'],
                oldData: null,
                newData: [
                    'subject' => (string) $payload['subject'],
                ],
            );
        });
    }

    /**
     * Get paginated list of users with filtering
     *
     * @param array $filters {
     *     q?: string,
     *     status?: 'active'|'banned'|'all',
     *     page?: int,
     *     per_page?: int,
     *     order_by?: string
     * }
    * @return LengthAwarePaginator
     */
    public function getUsers(array $filters = []): LengthAwarePaginator
    {
        return $this->userRepository->searchForAdmin($filters);
    }
}
