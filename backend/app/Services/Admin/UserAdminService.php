<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Admin\AdminResourceEnum;
use App\Enums\Notification\EntityTypeEnum;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
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
                resourceType: AdminResourceEnum::USER,
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
                entityType: EntityTypeEnum::USER,
                entityId: $user->id,
                context: [
                    'resource_type' => AdminResourceEnum::USER->value,
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
                resourceType: AdminResourceEnum::USER,
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
                entityType: EntityTypeEnum::USER,
                entityId: $user->id,
                context: [
                    'resource_type' => AdminResourceEnum::USER->value,
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
                resourceType: AdminResourceEnum::USER,
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
                entityType: EntityTypeEnum::USER,
                entityId: $user->id,
                context: [
                    'resource_type' => AdminResourceEnum::USER->value,
                    'resource_id' => $user->id,
                ]
            );
        });
    }
}
