<?php

namespace App\Services;

use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Exceptions\http\BusinessException;
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
     * @param array $payload {user_id?: int, appeal_type: string, resource_id: int, resource_type: string, reason: string}
     * @return Appeal
     */
    public function create(array $payload): Appeal
    {
        $userId = $payload['user_id'] ?? $this->guard()->user()->id;

        $isExistPrevAppeal = $this->appealRepository->hasPendingAppeal(
            userId: $userId,
            appealType: (string) $payload['appeal_type'],
            resourceId: $payload['resource_id'] ?? null,
        );

        if ($isExistPrevAppeal) {
            throw new BusinessException('You already have a pending appeal for this action', [
                'appeal_id' => 'A pending appeal already exists',
            ]);
        }

        $token = Str::random(64);
        $windowDays = (int) config('services.ai_moderation.appeal_window_days', 7);


        return $this->appealRepository->create([
                'user_id' => $userId,
                'appeal_type' => $payload['appeal_type'],
                'resource_id' => $payload['resource_id'] ?? null,
                'resource_type' => $payload['resource_type'],
                'reason' => $payload['reason'],
                'status' => AppealStatusEnum::PENDING->value,
                'appeal_token' => $token,
                'appeal_token_expires_at' => now()->addDays($windowDays),
            ]);
    }

    /**
     * Validate an appeal token and return the appeal if valid.
     *
     * @param string $token The appeal token from the email link
     * @return Appeal
     * @throws NotFoundException If the token is invalid
     * @throws BusinessException If the token has expired or appeal already reviewed
     */
    public function validateToken(string $token): Appeal
    {
        $appeal = $this->appealRepository->findByToken($token);

        if (!$appeal) {
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
     * Submit evidence for a token-based appeal (public endpoint).
     *
     * @param string $token The appeal token
     * @param string $reason User's appeal reason
     * @param array<\Illuminate\Http\UploadedFile> $evidenceFiles Uploaded evidence images
     * @return Appeal
     */
    public function submitEvidence(string $token, string $reason, array $evidenceFiles = []): Appeal
    {
        $appeal = $this->validateToken($token);

        $evidenceFileIds = [];
        foreach ($evidenceFiles as $file) {
            $uploaded = $this->uploadService->image($file);
            $evidenceFileIds[] = $uploaded['id'];
        }

        $appeal->update([
            'reason' => $reason,
            'evidence_file_ids' => !empty($evidenceFileIds) ? $evidenceFileIds : null,
        ]);

        return $appeal->fresh();
    }

    /**
     * Get appeals for authenticated user
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getAppeals(array $filters): LengthAwarePaginator
    {
        $user = $this->guard()->user();
        return $this->appealRepository->getByUser($user->id, $filters);
    }
}
