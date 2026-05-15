<?php

namespace App\Services;

use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Enums\Post\PostTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\ForbiddenException;
use App\Exceptions\http\NotFoundException;
use App\Models\Appeal;
use App\Repositories\AppealRepository;
use App\Repositories\PostRepository;
use App\Models\User;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AppealService
{
    use HasAuthUser;

    public function __construct(
        private readonly AppealRepository $appealRepository,
        private readonly PostRepository $postRepository,
        private readonly UploadService $uploadService,
    ) {}

    /**
     * File a new appeal (authenticated user only).
     * @param  array{appeal_type: string, resource_type: string, resource_uuid?: string|null, reason: string}  $payload
     * @param  array<\Illuminate\Http\UploadedFile>  $evidenceFiles
     * @throws BusinessException
     * @throws ForbiddenException
     * @throws NotFoundException
     */
    public function create(array $payload, array $evidenceFiles = []): Appeal
    {
        $user = $this->guard()->user();
        $userId = $user->id;

        $appealType = AppealTypeEnum::from((string) $payload['appeal_type']);
        $resourceType = ResourceTypeEnum::from((string) $payload['resource_type']);
        $resourceUuid = $payload['resource_uuid'] ?? null;

        $resourceId = $this->validateAppealResource(
            appealType: $appealType,
            resourceType: $resourceType,
            resourceUuid: $resourceUuid,
            userId: $userId,
        );

        $pendingAppeal = $this->appealRepository->findPendingAppeal(
            userId: $userId,
            appealType: $appealType->value,
            resourceType: $resourceType->value,
            resourceId: $resourceId,
        );

        if ($pendingAppeal) {
            throw new BusinessException('A pending appeal already exists for this resource.', [
                'existing_appeal_uuid' => $pendingAppeal->uuid,
                'appeal_type' => 'Pending appeal exists for this resource',
            ]);
        }

        $evidenceFileIds = $this->uploadEvidenceFiles($evidenceFiles);

        return $this->appealRepository->create([
            'user_id' => $userId,
            'appeal_type' => $appealType->value,
            'resource_id' => $resourceId,
            'resource_type' => $resourceType->value,
            'reason' => $payload['reason'],
            'status' => AppealStatusEnum::PENDING->value,
            'evidence_file_ids' => ! empty($evidenceFileIds) ? $evidenceFileIds : null,
        ]);
    }

    /**
     * Ensure appeal resource exists and belongs to the current user.
     * @throws BusinessException
     * @throws ForbiddenException
     * @throws NotFoundException
     */
    private function validateAppealResource(
        AppealTypeEnum $appealType,
        ResourceTypeEnum $resourceType,
        ?string $resourceUuid,
        int $userId
    ): ?int {
        return match ($appealType) {
            AppealTypeEnum::USER_BAN => $this->validateUserBanAppeal($resourceType, $resourceUuid, $userId),
            AppealTypeEnum::USER_DELETED => $this->validateUserDeletionAppeal($resourceType, $resourceUuid, $userId),
            AppealTypeEnum::POST_DELETED => $this->validatePostAppeal($resourceType, $resourceUuid, $userId),
            AppealTypeEnum::COMMENT_DELETED => $this->validateCommentAppeal($resourceType, $resourceUuid, $userId),
        };
    }

    private function validateUserBanAppeal(
        ResourceTypeEnum $resourceType,
        ?string $resourceUuid,
        int $userId
    ): int {
        if ($resourceType !== ResourceTypeEnum::USER) {
            throw new BusinessException('Invalid resource type for user ban appeal.', [
                'resource_type' => 'Resource type must be user for account appeals',
            ]);
        }
        /** @var \App\Models\User $user */
        $user = $this->guard()->user();
        if (! $user->isBanned()) {
            throw new BusinessException('Your account is not currently banned.', [
                'appeal_type' => 'User is not banned',
            ]);
        }

        if ($resourceUuid !== null) {
            $resolvedUser = User::where('uuid', $resourceUuid)->first();
            if ($resolvedUser && $resolvedUser->id !== $userId) {
                throw new ForbiddenException('You can only appeal your own account.');
            }
        }

        return $userId;
    }

    private function validateUserDeletionAppeal(
        ResourceTypeEnum $resourceType,
        ?string $resourceUuid,
        int $userId
    ): int {
        if ($resourceType !== ResourceTypeEnum::USER) {
            throw new BusinessException('Invalid resource type for user deletion appeal.', [
                'resource_type' => 'Resource type must be user for account appeals',
            ]);
        }

        if ($resourceUuid !== null) {
            $resolvedUser = User::where('uuid', $resourceUuid)->first();
            if ($resolvedUser && $resolvedUser->id !== $userId) {
                throw new ForbiddenException('You can only appeal your own account.');
            }
        }

        return $userId;
    }

    private function validatePostAppeal(
        ResourceTypeEnum $resourceType,
        ?string $resourceUuid,
        int $userId
    ): int {
        if (! $resourceUuid) {
            throw new BusinessException('Resource UUID is required for this appeal type.', [
                'resource_uuid' => 'Resource UUID is required',
            ]);
        }

        $expectedType = match ($resourceType) {
            ResourceTypeEnum::POST => PostTypeEnum::POST,
            ResourceTypeEnum::RE_POST => PostTypeEnum::RE_POST,
            ResourceTypeEnum::QUOTE_POST => PostTypeEnum::QUOTE_POST,
            default => null,
        };

        if ($expectedType === null) {
            throw new BusinessException('Invalid resource type for post appeal.', [
                'resource_type' => 'Resource type must be post, re-post, or quote-post',
            ]);
        }

        $post = $this->postRepository->findWithTrashedByUuid($resourceUuid);
        if (! $post) {
            throw new NotFoundException('Post not found for appeal');
        }

        if ($post->user_id !== $userId) {
            throw new ForbiddenException('You can only appeal your own posts.');
        }

        if ($post->type !== $expectedType) {
            throw new BusinessException('Resource type does not match the post.', [
                'resource_type' => 'Resource type mismatch',
            ]);
        }

        return $post->id;
    }

    private function validateCommentAppeal(
        ResourceTypeEnum $resourceType,
        ?string $resourceUuid,
        int $userId
    ): int {
        if ($resourceType !== ResourceTypeEnum::COMMENT) {
            throw new BusinessException('Invalid resource type for comment appeal.', [
                'resource_type' => 'Resource type must be comment for comment appeals',
            ]);
        }

        if (! $resourceUuid) {
            throw new BusinessException('Resource UUID is required for this appeal type.', [
                'resource_uuid' => 'Resource UUID is required',
            ]);
        }

        $comment = $this->postRepository->findWithTrashedByUuid($resourceUuid);
        if (! $comment) {
            throw new NotFoundException('Comment not found for appeal');
        }

        if ($comment->user_id !== $userId) {
            throw new ForbiddenException('You can only appeal your own comments.');
        }

        if ($comment->type !== PostTypeEnum::COMMENT) {
            throw new BusinessException('Resource type does not match the comment.', [
                'resource_type' => 'Resource type mismatch',
            ]);
        }

        return $comment->id;
    }

    /**
     * Update an existing appeal (authenticated user only).
     * Only pending appeals can be updated.
     * @param  string  $uuid  The appeal UUID
     * @param  string  $reason  Updated reason
     * @param  array<\Illuminate\Http\UploadedFile>  $evidenceFiles  New evidence images
     * @throws NotFoundException
     * @throws ForbiddenException
     * @throws BusinessException If the appeal has already been reviewed
     */
    public function updateAppeal(string $uuid, string $reason, array $evidenceFiles = []): Appeal
    {
        $appeal = $this->findByUuidForOwner($uuid);

        if ($appeal->status !== AppealStatusEnum::PENDING) {
            throw new BusinessException('This appeal has already been reviewed.', [
                'status' => 'Appeal already reviewed',
            ]);
        }

        return $this->applyEvidence($appeal, $reason, $evidenceFiles);
    }

    /**
     * Apply reason and evidence files to an appeal.
     * @param  array<\Illuminate\Http\UploadedFile>  $evidenceFiles
     */
    private function applyEvidence(Appeal $appeal, string $reason, array $evidenceFiles = []): Appeal
    {
        $evidenceFileIds = $this->uploadEvidenceFiles($evidenceFiles);

        $updateData = ['reason' => $reason];
        if (! empty($evidenceFileIds)) {
            // Merge with existing evidence files if any
            $existingIds = $appeal->evidence_file_ids ?? [];
            $updateData['evidence_file_ids'] = array_values(array_unique(array_merge($existingIds, $evidenceFileIds)));
        }

        $appeal->update($updateData);

        return $appeal->fresh();
    }

    /**
     * Find an appeal by UUID for the authenticated owner.
     * @throws NotFoundException
     * @throws ForbiddenException
     */
    public function findByUuidForOwner(string $uuid): Appeal
    {
        $appeal = $this->appealRepository->findByUuid($uuid);

        if (! $appeal) {
            throw new NotFoundException('Appeal not found');
        }

        $userId = $this->guard()->user()?->id;
        if (! $userId || $appeal->user_id !== $userId) {
            throw new ForbiddenException('You do not have permission to view this appeal');
        }

        return $appeal;
    }

    /**
     * Upload evidence files and return their IDs.
     * @param  array<\Illuminate\Http\UploadedFile>  $evidenceFiles
     * @return array<int>
     */
    private function uploadEvidenceFiles(array $evidenceFiles): array
    {
        $fileIds = [];
        foreach ($evidenceFiles as $file) {
            $uploaded = $this->uploadService->image($file);
            $fileIds[] = $uploaded['id'];
        }

        return $fileIds;
    }

    /**
     * Get appeals for authenticated user.
     * @param  array{appeal_status?: string, appeal_type?: string, per_page?: int}  $filters
     */
    public function getAppeals(array $filters): LengthAwarePaginator
    {
        $user = $this->guard()->user();

        return $this->appealRepository->getByUser($user->id, $filters);
    }
}
