<?php

namespace App\Services;

use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\NotFoundException;
use App\Models\Appeal;
use App\Models\User;
use App\Repositories\AppealRepository;
use App\Repositories\PostRepository;
use App\Services\Admin\AdminLogService;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * AppealService - Handles appeal business logic
 */
class AppealService
{
    use HasAuthUser;

    /**
     * AppealService constructor.
     */
    public function __construct(
        private readonly AppealRepository $appealRepository,
        private readonly PostRepository $postRepository,
        private readonly AdminLogService $adminLogService,
    ) {}

    /**
     * File a new appeal
     * @param User $user The user filing the appeal
     * @param array $payload {appeal_type: string, resource_id: int, resource_type: string, reason: string}
     * @return Appeal
     */
    public function create(User $user, array $payload): Appeal
    {
        // Check if user already has a pending appeal for same resource
        if ($this->appealRepository->hasPendingAppeal(
            userId: $user->id,
            appealType: (string) $payload['appeal_type'],
            resourceId: $payload['resource_id'] ?? null,
        )) {
            throw new BusinessException('You already have a pending appeal for this action', [
                'appeal_id' => 'A pending appeal already exists',
            ]);
        }

        return DB::transaction(function () use ($payload, $user): Appeal {
            return $this->appealRepository->create([
                'user_id' => $user->id,
                'appeal_type' => $payload['appeal_type'],
                'resource_id' => $payload['resource_id'] ?? null,
                'resource_type' => $payload['resource_type'],
                'reason' => $payload['reason'],
                'status' => AppealStatusEnum::PENDING->value,
            ]);
        });
    }

    /**
     * Get appeals for authenticated user
     * @param User $user The user whose appeals to retrieve
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getUserAppeals(User $user, array $filters): LengthAwarePaginator
    {
        return $this->appealRepository->getByUser($user->id, $filters);
    }

    /**
     * Get all appeals (admin view)
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getAllAppeals(array $filters): LengthAwarePaginator
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
            $appealType = $appeal->appeal_type instanceof AppealTypeEnum
                ? $appeal->appeal_type
                : AppealTypeEnum::from($appeal->appeal_type);

            // Update appeal status
            $appeal->update([
                'status' => AppealStatusEnum::APPROVED->value,
                'admin_response' => $payload['admin_response'] ?? null,
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            // Reverse the admin action based on appeal type
            $this->reverseAdminAction($appeal);

            // Log the approval
            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::APPEAL,
                resourceId: $appeal->id,
                action: AdminActionEnum::APPROVE_APPEAL,
                reason: 'Appeal approved for: ' . $appealType->label(),
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
            $appealType = $appeal->appeal_type instanceof AppealTypeEnum
                ? $appeal->appeal_type
                : AppealTypeEnum::from($appeal->appeal_type);

            // Update appeal status
            $appeal->update([
                'status' => AppealStatusEnum::REJECTED->value,
                'admin_response' => $payload['admin_response'],
                'reviewed_by' => $admin->id,
                'reviewed_at' => now(),
            ]);

            // Log the rejection
            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::APPEAL,
                resourceId: $appeal->id,
                action: AdminActionEnum::REJECT_APPEAL,
                reason: 'Appeal rejected for: ' . $appealType->label(),
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
            AppealTypeEnum::USER_BAN => $this->unbanUserByAppeal($appeal),
            AppealTypeEnum::POST_HIDDEN => $this->unhidePost($appeal),
            AppealTypeEnum::POST_DELETED => $this->restorePost($appeal),
            AppealTypeEnum::COMMENT_DELETED => $this->restoreComment($appeal),
            default => null,
        };
    }

    /**
     * Unban user when appeal approved
     */
    private function unbanUserByAppeal(Appeal $appeal): void
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
     */
    private function unhidePost(Appeal $appeal): void
    {
        if ($appeal->resource_id && $appeal->resource_type === ResourceTypeEnum::POST->value) {
            $post = $this->postRepository->find($appeal->resource_id);
            if ($post) {
                $post->update(['hidden_at' => null, 'hidden_reason' => null]);
            } else {
                Log::warning("Post {$appeal->resource_id} not found for appeal {$appeal->id} reversal");
            }
        }
    }

    /**
     * Restore post when appeal approved
     */
    private function restorePost(Appeal $appeal): void
    {
        if ($appeal->resource_id && $appeal->resource_type === ResourceTypeEnum::POST->value) {
            $restored = $this->postRepository->restoreById($appeal->resource_id);
            if (!$restored) {
                Log::warning("Post {$appeal->resource_id} not found for appeal {$appeal->id} restoration");
            }
        }
    }

    /**
     * Restore comment when appeal approved
     */
    private function restoreComment(Appeal $appeal): void
    {
        if ($appeal->resource_id && $appeal->resource_type === ResourceTypeEnum::COMMENT->value) {
            $restored = $this->postRepository->restoreById($appeal->resource_id);
            if (!$restored) {
                Log::warning("Comment {$appeal->resource_id} not found for appeal {$appeal->id} restoration");
            }
        }
    }

}
