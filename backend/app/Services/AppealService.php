<?php

namespace App\Services;

use App\Enums\Appeal\AppealStatusEnum;
use App\Exceptions\http\BusinessException;
use App\Models\Appeal;
use App\Repositories\AppealRepository;
use App\Repositories\PostRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

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
    ) {}

    /**
     * File a new appeal
     * @param array $payload {appeal_type: string, resource_id: int, resource_type: string, reason: string}
     * @return Appeal
     */
    public function create(array $payload): Appeal
    {
        $user = $this->guard()->user();

        $isExistPrevAppeal = $this->appealRepository->hasPendingAppeal(
            userId: $user->id,
            appealType: (string) $payload['appeal_type'],
            resourceId: $payload['resource_id'] ?? null,
        );

        if ($isExistPrevAppeal) {
            throw new BusinessException('You already have a pending appeal for this action', [
                'appeal_id' => 'A pending appeal already exists',
            ]);
        }
        return $this->appealRepository->create([
                'user_id' => $user->id,
                'appeal_type' => $payload['appeal_type'],
                'resource_id' => $payload['resource_id'] ?? null,
                'resource_type' => $payload['resource_type'],
                'reason' => $payload['reason'],
                'status' => AppealStatusEnum::PENDING->value,
            ]);
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
