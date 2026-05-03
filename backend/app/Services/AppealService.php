<?php

namespace App\Services;

use App\Enums\Appeal\AppealStatusEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\ForbiddenException;
use App\Exceptions\http\NotFoundException;
use App\Mail\GuestAppealTokenMail;
use App\Models\Appeal;
use App\Models\AppealToken;
use App\Repositories\AppealRepository;
use App\Repositories\AppealTokenRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AppealService
{
    use HasAuthUser;

    /**
     * AppealService constructor.
     */
    public function __construct(
        private readonly AppealRepository $appealRepository,
        private readonly AppealTokenRepository $appealTokenRepository,
        private readonly UploadService $uploadService,
        private readonly AppealOwnershipService $appealOwnershipService,
    ) {}

    /**
     * File a new appeal (authenticated user flow)
     *
     * @param  array  $payload
     *              [
     *                - appeal_type: string,
     *                - resource_id: int,
     *                - resource_type: string,
     *                - reason: string
     *             ]
     *             $evidenceFiles Array of UploadedFile instances for evidence images
     *
     */
    public function create(array $payload, array $evidenceFiles = []): Appeal
    {
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
            'resource_id' => $payload['resource_id'] ?? null,
            'resource_type' => $payload['resource_type'],
            'reason' => $payload['reason'],
            'status' => AppealStatusEnum::PENDING->value,
            'evidence_file_ids' => ! empty($evidenceFileIds) ? $evidenceFileIds : null,
        ]);
    }

    /**
     * Request an appeal token for a given email (guest flow).
     *
     * @param  array{
     *          - email: string,
     *          - appeal_type: string,
     *          - resource_id: int,
     *          - resource_type: string
     *      }  $payload
     */
    public function requestToken(array $payload): void
    {
        $this->appealOwnershipService->validate(
            email: $payload['email'],
            resourceType: $payload['resource_type'],
            resourceId: $payload['resource_id']
        );

        $token = Str::random(64);
        $windowDays = (int) config('services.ai_moderation.appeal_window_days', 7);

        $appealToken = $this->appealTokenRepository->create([
            'email' => $payload['email'],
            'token_hash' => hash('sha256', $token),
            'appeal_type' => $payload['appeal_type'],
            'resource_id' => $payload['resource_id'],
            'resource_type' => $payload['resource_type'],
            'expires_at' => now()->addDays($windowDays),
        ]);

        $baseUrl = rtrim((string) config('app.frontend_url'), '/');
        $appealLink = $baseUrl.'/en/appeal?token='.urlencode($appealToken->token);

        try {
            Mail::to($appealToken->email)->send(new GuestAppealTokenMail($appealLink));
        } catch (\Throwable $exception) {
            Log::warning('Failed to send guest appeal token email', [
                'email' => $appealToken->email,
                'error' => $exception->getMessage(),
            ]);
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
