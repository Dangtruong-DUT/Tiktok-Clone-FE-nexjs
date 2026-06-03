<?php

namespace App\Repositories;

use App\Models\AiViralScore;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepository<AiViralScore>
 */
class AiViralScoreRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new AiViralScore());
    }

    public function findByUuidAndUserOrFail(string $uuid, int $userId): AiViralScore
    {
        /** @var AiViralScore */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function paginateByUser(int $userId, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
