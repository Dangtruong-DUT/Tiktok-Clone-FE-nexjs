<?php

namespace App\Repositories;

use App\Enums\Ai\AiContentSuggestionStatusEnum;
use App\Models\AiContentSuggestion;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepository<AiContentSuggestion>
 */
class AiContentSuggestionRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new AiContentSuggestion());
    }

    public function paginateByUser(int $userId, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findByUuidAndUserOrFail(string $uuid, int $userId): AiContentSuggestion
    {
        /** @var AiContentSuggestion */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function findLatestByHashAndUser(int $userId, string $hash, array $statuses): ?AiContentSuggestion
    {
        /** @var AiContentSuggestion|null */
        return $this->query()
            ->where('user_id', $userId)
            ->where('request_hash', $hash)
            ->whereIn('status', $statuses)
            ->latest()
            ->first();
    }

    public function countTodayByUser(int $userId): int
    {
        return $this->query()
            ->where('user_id', $userId)
            ->where('created_at', '>=', now()->startOfDay())
            ->count();
    }

    public function countTodayGlobal(): int
    {
        return $this->query()
            ->where('created_at', '>=', now()->startOfDay())
            ->count();
    }
}
