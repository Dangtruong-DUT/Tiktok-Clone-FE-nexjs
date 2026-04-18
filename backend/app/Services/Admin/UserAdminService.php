<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Mail\AdminDirectMessageMail;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use BadMethodCallException;

/**
 * UserAdminService - User management operations for admins
 * Handles: ban, unban, delete users
 * All operations are logged via AdminLogService
 */
class UserAdminService
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly AdminLogService $adminLogService,
        private readonly AdminModerationNoticeService $adminModerationNoticeService,
    ) {}

    /**
     * Get paginated list of users with filtering
     *
     * @param array $filters {
     *     search?: string,
     *     status?: 'active'|'banned'|'all',
     *     page?: int,
     *     per_page?: int,
     *     sort_by?: string
     * }
    * @return LengthAwarePaginator
     */
    public function getFilteredUsers(array $filters = []): LengthAwarePaginator
    {
        return $this->userRepository->searchForAdmin($filters);
    }

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
     * Ban a user account
     *
     * @param User $admin The admin performing the action
     * @param int $userId The target user ID
     * @param array $data {reason: string, duration_days?: int}
     * @return User Updated user
     * @throws \Exception
     */
    public function banUser(User $admin, int $userId, array $data): User
    {
        /** @var User $user */
        $user = $this->userRepository->findOrFail($userId);

        // Prevent banning self
        if ($admin->id === $user->id) {
            throw new BadMethodCallException('You cannot ban yourself');
        }

        // Prevent double-banning
        if ($user->banned_at !== null) {
            throw new BadMethodCallException('User is already banned');
        }

        return DB::transaction(function () use ($admin, $user, $userId, $data) {
            $oldData = $user->only(['banned_at', 'ban_reason', 'ban_duration_days']);

            // Update user
            $user->update([
                'banned_at' => now(),
                'ban_reason' => $data['reason'],
                'ban_duration_days' => $data['duration_days'] ?? null,
            ]);

            // Log the action
            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::USER,
                resourceId: $userId,
                action: AdminActionEnum::BAN,
                reason: $data['reason'],
                oldData: $oldData,
                newData: $user->only(['banned_at', 'ban_reason', 'ban_duration_days']),
            );

            $this->adminModerationNoticeService->send(
                admin: $admin,
                targetUser: $user,
                action: AdminActionEnum::BAN,
                reason: (string) $data['reason'],
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
     * Unban a user account
     *
     * @param User $admin The admin performing the action
     * @param int $userId The target user ID
     * @return User Updated user
     * @throws \Exception
     */
    public function unbanUser(User $admin, int $userId): User
    {
        /** @var User $user */
        $user = $this->userRepository->findOrFail($userId);

        // Check if user is actually banned
        if ($user->banned_at === null) {
            throw new BadMethodCallException('User is not banned');
        }

        return DB::transaction(function () use ($admin, $user, $userId) {
            $oldData = $user->only(['banned_at', 'ban_reason', 'ban_duration_days']);

            // Update user
            $user->update([
                'banned_at' => null,
                'ban_reason' => null,
                'ban_duration_days' => null,
            ]);

            // Log the action
            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::USER,
                resourceId: $userId,
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
     * Delete a user account (soft delete)
     *
     * @param User $admin The admin performing the action
     * @param int $userId The target user ID
     * @param array $data {reason: string}
     * @return void
     * @throws \Exception
     */
    public function deleteUser(User $admin, int $userId, array $data): void
    {
        /** @var User $user */
        $user = $this->userRepository->findOrFail($userId);

        // Prevent deleting self
        if ($admin->id === $user->id) {
            throw new BadMethodCallException('You cannot delete yourself');
        }

        DB::transaction(function () use ($admin, $user, $userId, $data) {
            $oldData = [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
            ];

            // Soft delete the user
            $user->delete();

            // Log the action
            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::USER,
                resourceId: $userId,
                action: AdminActionEnum::DELETE_USER,
                reason: $data['reason'],
                oldData: $oldData,
                newData: null,
            );

            $this->adminModerationNoticeService->send(
                admin: $admin,
                targetUser: $user,
                action: AdminActionEnum::DELETE_USER,
                reason: (string) $data['reason'],
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
     * @param User $admin
     * @param int $userId
     * @param array{password:string} $data
     * @return User
     */
    public function resetUserPassword(User $admin, int $userId, array $data): User
    {
        /** @var User $user */
        $user = $this->userRepository->findOrFail($userId);

        return DB::transaction(function () use ($admin, $user, $userId, $data) {
            $user->password = (string) $data['password'];
            $user->save();

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::USER,
                resourceId: $userId,
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
     * @param User $admin
     * @param int $userId
     * @param array{subject:string,message:string} $data
     * @return void
     */
    public function sendMailToUser(User $admin, int $userId, array $data): void
    {
        /** @var User $user */
        $user = $this->userRepository->findOrFail($userId);

        if (empty($user->email)) {
            throw new BadMethodCallException('Target user does not have an email address');
        }

        DB::transaction(function () use ($admin, $user, $userId, $data) {
            Mail::to($user->email)->send(new AdminDirectMessageMail(
                admin: $admin,
                targetUser: $user,
                subjectLine: (string) $data['subject'],
                messageBody: (string) $data['message'],
            ));

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::USER,
                resourceId: $userId,
                action: AdminActionEnum::SEND_EMAIL_TO_USER,
                reason: (string) $data['subject'],
                oldData: null,
                newData: [
                    'subject' => (string) $data['subject'],
                ],
            );
        });
    }
}
