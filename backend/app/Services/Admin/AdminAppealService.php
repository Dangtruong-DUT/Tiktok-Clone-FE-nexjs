<?php

namespace App\Services\Admin;

use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\NotFoundException;
use App\Models\Appeal;
use App\Repositories\AppealRepository;
use App\Repositories\PostRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator as PaginationLengthAwarePaginator;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * AdminAppealService - Handles appeal business logic for admins
 */
class AdminAppealService
{
    use HasAuthUser;

    /**
     * AdminAppealService constructor.
     */
    public function __construct(
        private readonly AppealRepository $appealRepository,
        private readonly PostRepository $postRepository,
        private readonly AdminLogService $adminLogService,
    ) {}

    /**
     * Get appeals (admin view)
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getAppeals(array $filters): PaginationLengthAwarePaginator
    {
        return $this->appealRepository->getForAdmin($filters);
    }


    /**
     * Approve an appeal and reverse the admin action
     * @param array{appeal_uuid:string,admin_response?:string} $payload
     * @return Appeal
     */
    public function approve(array $payload): Appeal
    {
        $admin = $this->guard()->user();
        $appeal = $this->appealRepository->findByUuid((string) $payload['appeal_uuid']);

        if (!$appeal) {
            throw new NotFoundException('Appeal not found');
        }

        if ($appeal->status !== AppealStatusEnum::PENDING->value) {
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
                reason: 'Appeal approved for: ' . $appeal->appeal_type->label(),
                oldData: $oldData,
                newData: $appeal->only(['status', 'admin_response', 'reviewed_by', 'reviewed_at']),
            );

            return $appeal;
        });
    }

    /**
     * Reject an appeal
     * @param array{appeal_uuid:string,admin_response:string} $payload
     * @return Appeal
     */
    public function reject(array $payload): Appeal
    {
        $admin = $this->guard()->user();
        $appeal = $this->appealRepository->findByUuid((string) $payload['appeal_uuid']);

        if (!$appeal) {
            throw new NotFoundException('Appeal not found');
        }

        if ($appeal->status !== AppealStatusEnum::PENDING->value) {
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
                reason: 'Appeal rejected for: ' .  $appeal->appeal_type->label(),
                oldData: $oldData,
                newData: $appeal->only(['status', 'admin_response', 'reviewed_by', 'reviewed_at']),
            );

            return $appeal;
        });
    }

    /**
     * Reverse an admin action when appeal is approved
     * @param Appeal $appeal
     * @return void
     */
    private function reverseAdminAction(Appeal $appeal): void
    {
        match($appeal->appeal_type) {
            AppealTypeEnum::USER_BAN => $this->unbanUser($appeal),
            AppealTypeEnum::POST_HIDDEN => $this->unhidePost($appeal),
            AppealTypeEnum::POST_DELETED => $this->restorePost($appeal),
            AppealTypeEnum::COMMENT_DELETED => $this->restorePost($appeal),
            AppealTypeEnum::COMMENT_HIDDEN => $this->unhidePost($appeal),
            default => null,
        };
    }

    /**
     * Unban user when appeal approved
     */
    private function unbanUser(Appeal $appeal): void
    {
        $user = $appeal->user;
        $user->update([
            'banned_at' => null,
            'ban_reason' => null,
            'ban_duration_days' => null,
        ]);
    }

    /**
     * Unhide post when appeal approved
     * @param Appeal $appeal
      * @return void
     */
    private function unhidePost(Appeal $appeal): void
    {
        if ($appeal->resource_id &&
            (
            $appeal->resource_type === ResourceTypeEnum::POST->value
            || $appeal->resource_type === ResourceTypeEnum::COMMENT->value
            )
        ) {
            $post = $this->postRepository->findOrFail($appeal->resource_id);
            $post->update(['hidden_at' => null, 'hidden_reason' => null]);
        }
    }

    /**
     * Restore post when appeal approved
     *  @param Appeal $appeal
      * @return void
     */
    private function restorePost(Appeal $appeal): void
    {
        if ($appeal->resource_id &&
            (
            $appeal->resource_type === ResourceTypeEnum::POST->value
            || $appeal->resource_type === ResourceTypeEnum::COMMENT->value
            )
        ) {
            $restored = $this->postRepository->restoreById($appeal->resource_id);
            if (!$restored) {
                throw new NotFoundException('Post not found for appeal restoration');
            }
        }
    }
}
