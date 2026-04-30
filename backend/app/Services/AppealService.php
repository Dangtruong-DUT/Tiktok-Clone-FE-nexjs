<?php

namespace App\Services;

use App\Enums\Appeal\AppealStatusEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\ForbiddenException;
use App\Exceptions\http\NotFoundException;
use App\Models\Appeal;
use App\Repositories\AppealRepository;
use App\Repositories\PostRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

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
        private readonly UploadService $uploadService,
    ) {}

    /**
     * File a new appeal (authenticated user flow)
     *
     * @param  array  $payload  {user_id?: int, appeal_type: string, resource_id: int, resource_type: string, reason: string}
     */
    public function create(array $payload, array $evidenceFiles = []): Appeal
    {
        $userId = $payload['user_id'] ?? $this->guard()->user()->id;

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

        $token = Str::random(64);
        $windowDays = (int) config('services.ai_moderation.appeal_window_days', 7);

        $evidenceFileIds = $this->uploadEvidenceFiles($evidenceFiles);

        return $this->appealRepository->create([
            'user_id' => $userId,
            'appeal_type' => $payload['appeal_type'],
            'resource_id' => $payload['resource_id'] ?? null,
            'resource_type' => $payload['resource_type'],
            'reason' => $payload['reason'],
            'status' => AppealStatusEnum::PENDING->value,
            'appeal_token' => $token,
            'appeal_token_expires_at' => now()->addDays($windowDays),
            'evidence_file_ids' => ! empty($evidenceFileIds) ? $evidenceFileIds : null,
        ]);
    }

    /**
     * Validate an appeal token and return the appeal if valid.
     *
     * @param  string  $token  The appeal token from the email link
     *
     * @throws NotFoundException If the token is invalid
     * @throws BusinessException If the token has expired or appeal already reviewed
     */
    public function validateToken(string $token): Appeal
    {
        $appeal = $this->appealRepository->findByToken($token);

        if (! $appeal) {
            throw new NotFoundException('Invalid appeal link');
        }

        if ($appeal->isTokenExpired()) {
            throw new BusinessException('This appeal link has expired. Please contact support for assistance.', [
                'token' => 'Appeal link has expired',
            ]);
        }

        if ($appeal->status !== AppealStatusEnum::PENDING) {
            throw new BusinessException('This appeal has already been reviewed.', [
                'status' => 'Appeal already reviewed',
            ]);
        }

        return $appeal;
    }

    /**
     * Submit evidence for a token-based appeal (public, via POST /appeals with token).
     *
     * @param  string  $token  The appeal token
     * @param  string  $reason  User's appeal reason
     * @param  array<\Illuminate\Http\UploadedFile>  $evidenceFiles  Uploaded evidence images
     */
    public function submitEvidence(string $token, string $reason, array $evidenceFiles = []): Appeal
    {
        $appeal = $this->validateToken($token);

        return $this->applyEvidence($appeal, $reason, $evidenceFiles);
    }

    /**
     * Update an existing appeal (via PUT /appeals/{uuid}).
     *
     * Resolves ownership by token or auth:
     * - With token: public access, token proves ownership + validates expiry.
     * - Without token: auth required, must own the appeal.
     *
     * Only pending appeals can be updated.
     *
     * @param  string  $uuid  The appeal UUID
     * @param  string  $reason  Updated reason
     * @param  array<\Illuminate\Http\UploadedFile>  $evidenceFiles  New evidence images
     * @param  string|null  $token  Optional token for public access
     *
     * @throws NotFoundException
     * @throws ForbiddenException
     * @throws BusinessException If the appeal has already been reviewed
     */
    public function updateAppeal(string $uuid, string $reason, array $evidenceFiles = [], ?string $token = null): Appeal
    {
        $appeal = $token
            ? $this->findByUuidWithToken($uuid, $token)
            : $this->findByUuidForOwner($uuid);

        if ($appeal->status !== AppealStatusEnum::PENDING) {
            throw new BusinessException('This appeal has already been reviewed.', [
                'status' => 'Appeal already reviewed',
            ]);
        }

        return $this->applyEvidence($appeal, $reason, $evidenceFiles);
    }

    /**
     * Apply reason and evidence files to an appeal (shared logic for both token and auth flows).
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
     * Find an appeal by UUID with token verification (public access).
     *
     * @throws NotFoundException
     * @throws BusinessException
     */
    public function findByUuidWithToken(string $uuid, string $token): Appeal
    {
        $appeal = $this->appealRepository->findByUuid($uuid);

        if (! $appeal || $appeal->appeal_token !== $token) {
            throw new NotFoundException('Invalid appeal link');
        }

        if ($appeal->isTokenExpired()) {
            throw new BusinessException('This appeal link has expired. Please contact support for assistance.', [
                'token' => 'Appeal link has expired',
            ]);
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
