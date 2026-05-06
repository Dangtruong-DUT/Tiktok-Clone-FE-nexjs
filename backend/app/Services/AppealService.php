<?php

namespace App\Services;

use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\ForbiddenException;
use App\Exceptions\http\NotFoundException;
use App\Models\Appeal;
use App\Repositories\AppealRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AppealService
{
    use HasAuthUser;

    /**
     * AppealService constructor.
     */
    public function __construct(
        private readonly AppealRepository $appealRepository,
        private readonly UploadService $uploadService,
    ) {}

    /**
     * File a new appeal (authenticated user only).
     *
     * @param  array{appeal_type: string, resource_type: string, resource_id?: int|null, reason: string}  $payload
     * @param  array<\Illuminate\Http\UploadedFile>  $evidenceFiles
     */
    public function create(array $payload, array $evidenceFiles = []): Appeal
    {
        if ($payload['appeal_type']!=AppealTypeEnum::USER_BAN->value && empty($payload['resource_id'])) {
            throw new BusinessException('Resource ID is required for this appeal type.', [
                'resource_id' => 'Resource ID is required',
            ]);
        }


        $userId = $this->guard()->user()->id;

        $alreadyExists = $this->appealRepository->hasAppealForResource(
            userId: $userId,
            appealType: (string) $payload['appeal_type'],
            resourceId: $payload['resource_id'] ?? null,
        );

        if ($alreadyExists) {
            throw new BusinessException('An appeal already exists for this resource. Please edit your existing appeal instead.', [
                'appeal_type' => 'An appeal already exists for this resource',
            ]);
        }

        $evidenceFileIds = $this->uploadEvidenceFiles($evidenceFiles);

        return $this->appealRepository->create([
            'user_id' => $userId,
            'appeal_type' => $payload['appeal_type'],
            'resource_id' => $payload['resource_id'] ??  $userId,
            'resource_type' => $payload['resource_type'],
            'reason' => $payload['reason'],
            'status' => AppealStatusEnum::PENDING->value,
            'evidence_file_ids' => ! empty($evidenceFileIds) ? $evidenceFileIds : null,
        ]);
    }

    /**
     * Update an existing appeal (authenticated user only).
     *
     * Only pending appeals can be updated.
     *
     * @param  string  $uuid  The appeal UUID
     * @param  string  $reason  Updated reason
     * @param  array<\Illuminate\Http\UploadedFile>  $evidenceFiles  New evidence images
     *
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
     *
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
     *
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
     *
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
     * Get appeals for authenticated user
     */
    public function getAppeals(array $filters): LengthAwarePaginator
    {
        $user = $this->guard()->user();

        return $this->appealRepository->getByUser($user->id, $filters);
    }
}
