<?php

namespace App\Services;

use App\Enums\Appeal\AppealStatusEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\ForbiddenException;
use App\Exceptions\http\NotFoundException;
use App\Models\Appeal;
use App\Models\AppealToken;
use App\Repositories\AppealRepository;
use App\Repositories\AppealTokenRepository;
use App\Repositories\PostRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
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
        private readonly AppealTokenRepository $appealTokenRepository,
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
        $email = $payload['email'] ?? $this->guard()->user()?->email;

        $alreadyExists = $this->appealRepository->hasAppealForResource(
            userId: $userId,
            email: $email,
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
            'resource_id' => $payload['resource_id'] ?? null,
            'resource_type' => $payload['resource_type'],
            'reason' => $payload['reason'],
            'status' => AppealStatusEnum::PENDING->value,
            'email' => $email,
            'evidence_file_ids' => ! empty($evidenceFileIds) ? $evidenceFileIds : null,
        ]);
    }

    /**
     * Request an appeal token for a given email (guest flow).
     *
     * @param  array{email: string, appeal_type?: string, resource_id?: int|null, resource_type?: string|null}  $payload
     */
    public function requestToken(array $payload): AppealToken
    {
        $this->validateResourceOwnership($payload['email'], $payload['resource_type'] ?? null, $payload['resource_id'] ?? null);

        $token = Str::random(64);
        $windowDays = (int) config('services.ai_moderation.appeal_window_days', 7);

        return $this->appealTokenRepository->create([
            'email' => $payload['email'],
            'token' => $token,
            'appeal_type' => $payload['appeal_type'] ?? null,
            'resource_id' => $payload['resource_id'] ?? null,
            'resource_type' => $payload['resource_type'] ?? null,
            'expires_at' => now()->addDays($windowDays),
        ]);
    }

    /**
     * Validate that the provided email owns the specified resource.
     */
    private function validateResourceOwnership(string $email, ?string $resourceType, ?int $resourceId): void
    {
        if (! $resourceType || ! $resourceId) {
            throw new BusinessException('Resource information is required to verify ownership.');
        }

        $ownerEmail = null;

        switch ($resourceType) {
            case \App\Enums\Common\ModelEntityTypeEnum::USER->value:
                $ownerEmail = \App\Models\User::find($resourceId)?->email;
                break;
            case \App\Enums\Common\ModelEntityTypeEnum::POST->value:
                $ownerEmail = \App\Models\Post::with('user')->find($resourceId)?->user?->email;
                break;
            case \App\Enums\Common\ModelEntityTypeEnum::COMMENT->value:
                // Assuming Comment model exists
                $ownerEmail = \App\Models\Comment::with('user')->find($resourceId)?->user?->email;
                break;
            default:
                throw new BusinessException("Unsupported resource type for appeal: {$resourceType}");
        }

        if (! $ownerEmail || strtolower($ownerEmail) !== strtolower($email)) {
            throw new BusinessException('The provided email does not match the owner of this resource.');
        }
    }

    /**
     * Verify an appeal token and mark it used for the form step.
     */
    public function verifyToken(string $token): AppealToken
    {
        $appealToken = $this->appealTokenRepository->findByToken($token);

        if (! $appealToken) {
            throw new NotFoundException('Invalid appeal link');
        }

        if ($appealToken->isExpired()) {
            throw new BusinessException('This appeal link has expired. Please contact support for assistance.', [
                'token' => 'Appeal link has expired',
            ]);
        }

        if ($appealToken->appeal_id) {
            throw new BusinessException('This appeal link has already been used.', [
                'token' => 'Appeal link already used',
            ]);
        }

        if (! $appealToken->used_at) {
            $appealToken->update(['used_at' => now()]);
        }

        return $appealToken->fresh();
    }

    /**
     * Create an appeal using a verified token (guest flow).
     *
     * @param  array{appeal_type?: string, resource_id?: int|null, resource_type?: string|null, reason: string}  $payload
     */
    public function createFromToken(string $token, array $payload, array $evidenceFiles = []): Appeal
    {
        return DB::transaction(function () use ($token, $payload, $evidenceFiles) {
            $appealToken = $this->appealTokenRepository->query()->lockForUpdate()->where('token', $token)->first();

            if (! $appealToken) {
                throw new NotFoundException('Invalid appeal link');
            }

            if ($appealToken->isExpired()) {
                throw new BusinessException('This appeal link has expired. Please contact support for assistance.', [
                    'token' => 'Appeal link has expired',
                ]);
            }

            if (! $appealToken->used_at) {
                throw new BusinessException('Please verify your email before submitting the appeal.', [
                    'token' => 'Appeal email is not verified',
                ]);
            }

            if ($appealToken->appeal_id) {
                throw new BusinessException('This appeal link has already been used.', [
                    'token' => 'Appeal link already used',
                ]);
            }

            $appealType = $appealToken->appeal_type ?? ($payload['appeal_type'] ?? null);
            $resourceType = $appealToken->resource_type ?? ($payload['resource_type'] ?? null);
            $resourceId = $appealToken->resource_id ?? ($payload['resource_id'] ?? null);

            if (! $appealType || ! $resourceType) {
                throw new BusinessException('Appeal context is missing. Please contact support.', [
                    'appeal_type' => 'Appeal type is required',
                ]);
            }

            $evidenceFileIds = $this->uploadEvidenceFiles($evidenceFiles);

            $appeal = $this->appealRepository->create([
                'user_id' => null,
                'email' => $appealToken->email,
                'appeal_type' => $appealType,
                'resource_id' => $resourceId,
                'resource_type' => $resourceType,
                'reason' => $payload['reason'],
                'status' => AppealStatusEnum::PENDING->value,
                'evidence_file_ids' => ! empty($evidenceFileIds) ? $evidenceFileIds : null,
            ]);

            $appealToken->update(['appeal_id' => $appeal->id]);

            return $appeal;
        });
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

        $appealToken = $this->appealTokenRepository->findByToken($token);

        if (! $appeal || ! $appealToken || $appealToken->appeal_id !== $appeal->id) {
            throw new NotFoundException('Invalid appeal link');
        }

        if ($appealToken->isExpired()) {
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
