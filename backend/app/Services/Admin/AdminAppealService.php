<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\NotFoundException;
use App\Models\Appeal;
use App\Repositories\AppealRepository;
use App\Repositories\PostRepository;
use App\Repositories\UserRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator as PaginationLengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AdminAppealService
{
    use HasAuthUser;

    public function __construct(
        private readonly AppealRepository $appealRepository,
        private readonly PostRepository $postRepository,
        private readonly UserRepository $userRepository,
        private readonly AdminLogService $adminLogService,
        private readonly AdminModerationNoticeService $adminModerationNoticeService,
    ) {}

    /**
     * Get paginated appeals for admin review.
     * @param  array{status?: string, appeal_type?: string, per_page?: int, page?: int, order_by?: string}  $filters
     */
    public function getAppeals(array $filters): PaginationLengthAwarePaginator
    {
        return $this->appealRepository->getForAdmin($filters);
    }

    /**
     * Approve an appeal, reverse the original admin action, and notify the user.
     * @param  array{appeal_uuid:string,admin_response?:string}  $payload
     * @throws NotFoundException
     * @throws BusinessException
     */
    public function approve(array $payload): Appeal
    {
        $admin = $this->guard()->user();
        $appeal = $this->appealRepository->findByUuid((string) $payload['appeal_uuid']);

        if (! $appeal) {
            throw new NotFoundException('Appeal not found');
        }

        if ($appeal->status !== AppealStatusEnum::PENDING) {
            throw new BusinessException('This appeal has already been reviewed', [
                'status' => 'Appeal is not pending',
            ]);
        }

        return DB::transaction(function () use ($appeal, $admin, $payload): Appeal {
            $oldData = $appeal->only(['status', 'admin_response', 'reviewed_by', 'reviewed_at']);

            $appeal->update([
                'status' => AppealStatusEnum::APPROVED->value,
                'admin_response' => $payload['admin_response'] ?? null,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            $this->reverseAdminAction($appeal);

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::APPEAL,
                resourceId: $appeal->id,
                action: AdminActionEnum::APPROVE_APPEAL,
                reason: 'Appeal approved for: '.$appeal->appeal_type->label(),
                oldData: $oldData,
                newData: $appeal->only(['status', 'admin_response', 'reviewed_by', 'reviewed_at']),
            );

            $appealUser = $appeal->user()->withTrashed()->first();
            if ($appealUser) {
                $approvedMessage = $payload['admin_response']
                    ?? 'Your appeal has been reviewed and approved. The action has been reversed.';

                $this->adminModerationNoticeService->sendPositiveAction(
                    admin: $admin,
                    targetUser: $appealUser,
                    action: AdminActionEnum::APPROVE_APPEAL,
                    message: $approvedMessage,
                    entityType: ModelEntityTypeEnum::USER,
                    entityId: $appealUser->id,
                    context: [
                        'appeal_type' => $appeal->appeal_type->value,
                        'resource_type' => $appeal->resource_type,
                        'resource_id' => $appeal->resource_id,
                        'appeal_uuid' => $appeal->uuid,
                    ],
                );
            }

            return $appeal;
        });
    }

    /**
     * Reject an appeal and notify the user.
     * @param  array{appeal_uuid:string,admin_response:string}  $payload
     * @throws NotFoundException
     * @throws BusinessException
     */
    public function reject(array $payload): Appeal
    {
        $admin = $this->guard()->user();
        $appeal = $this->appealRepository->findByUuid((string) $payload['appeal_uuid']);

        if (! $appeal) {
            throw new NotFoundException('Appeal not found');
        }

        if ($appeal->status !== AppealStatusEnum::PENDING) {
            throw new BusinessException('This appeal has already been reviewed', [
                'status' => 'Appeal is not pending',
            ]);
        }

        return DB::transaction(function () use ($appeal, $admin, $payload): Appeal {
            $oldData = $appeal->only(['status', 'admin_response', 'reviewed_by', 'reviewed_at']);

            $appeal->update([
                'status' => AppealStatusEnum::REJECTED->value,
                'admin_response' => $payload['admin_response'],
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::APPEAL,
                resourceId: $appeal->id,
                action: AdminActionEnum::REJECT_APPEAL,
                reason: 'Appeal rejected for: '.$appeal->appeal_type->label(),
                oldData: $oldData,
                newData: $appeal->only(['status', 'admin_response', 'reviewed_by', 'reviewed_at']),
            );

            $appealUser = $appeal->user()->withTrashed()->first();
            if ($appealUser) {
                $this->adminModerationNoticeService->send(
                    admin: $admin,
                    targetUser: $appealUser,
                    action: AdminActionEnum::REJECT_APPEAL,
                    reason: $payload['admin_response'],
                    entityType: ModelEntityTypeEnum::USER,
                    entityId: $appealUser->id,
                    context: [
                        'appeal_type' => $appeal->appeal_type->value,
                        'resource_type' => $appeal->resource_type,
                        'resource_id' => $appeal->resource_id,
                        'appeal_uuid' => $appeal->uuid,
                    ],
                );
            }

            return $appeal;
        });
    }

    /**
     * Reverse the original moderation action when appeal is approved.
     * Each case logs its own restoration action for full audit trail.
     */
    private function reverseAdminAction(Appeal $appeal): void
    {
        $admin = $this->guard()->user();

        match ($appeal->appeal_type) {
            AppealTypeEnum::USER_BAN => $this->unbanUser($appeal, $admin),
            AppealTypeEnum::USER_DELETED => $this->restoreUser($appeal),
            AppealTypeEnum::POST_DELETED => $this->restorePost($appeal, AdminActionEnum::RESTORE_POST, $admin),
            AppealTypeEnum::COMMENT_DELETED => $this->restorePost($appeal, AdminActionEnum::RESTORE_COMMENT, $admin),
            default => null,
        };
    }

    private function unbanUser(Appeal $appeal, \App\Models\User $admin): void
    {
        $user = $appeal->user;
        if (! $user) {
            return;
        }

        $oldData = $user->only(['banned_at', 'ban_reason', 'ban_duration_days']);
        $user->update(['banned_at' => null, 'ban_reason' => null, 'ban_duration_days' => null]);

        $this->adminLogService->log(
            admin: $admin,
            resourceType: ResourceTypeEnum::USER,
            resourceId: $user->id,
            action: AdminActionEnum::UNBAN,
            reason: 'Unban via approved appeal #'.$appeal->id,
            oldData: $oldData,
            newData: ['banned_at' => null],
        );
    }

    private function restorePost(Appeal $appeal, AdminActionEnum $action, \App\Models\User $admin): void
    {
        $isPostType = in_array($appeal->resource_type, [
            ResourceTypeEnum::POST->value,
            ResourceTypeEnum::COMMENT->value,
        ], true);

        if (! $appeal->resource_id || ! $isPostType) {
            return;
        }

        $restored = $this->postRepository->restoreById($appeal->resource_id);
        if (! $restored) {
            throw new NotFoundException('Post not found for appeal restoration');
        }

        $resourceType = $appeal->resource_type === ResourceTypeEnum::COMMENT->value
            ? ResourceTypeEnum::COMMENT
            : ResourceTypeEnum::POST;

        $this->adminLogService->log(
            admin: $admin,
            resourceType: $resourceType,
            resourceId: $appeal->resource_id,
            action: $action,
            reason: 'Restored via approved appeal #'.$appeal->id,
            oldData: ['deleted_at' => 'not null'],
            newData: ['deleted_at' => null],
        );
    }

    private function restoreUser(Appeal $appeal): void
    {
        if (! $appeal->resource_id || $appeal->resource_type !== ResourceTypeEnum::USER->value) {
            throw new NotFoundException('User not found for appeal restoration');
        }

        $restored = (bool) $this->userRepository
            ->query()
            ->withTrashed()
            ->whereKey($appeal->resource_id)
            ->restore();

        if (! $restored) {
            throw new NotFoundException('User not found for appeal restoration');
        }
    }
}
