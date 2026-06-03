<?php

namespace App\Repositories;

use App\Models\AiContentCalendar;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepository<AiContentCalendar>
 */
class AiContentCalendarRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new AiContentCalendar());
    }

    public function findByUuidAndUserOrFail(string $uuid, int $userId): AiContentCalendar
    {
        /** @var AiContentCalendar */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function paginateByUser(int $userId, int $perPage): LengthAwarePaginator
    {
        return $this->query()
            ->where('user_id', $userId)
            ->withCount('items')   // exposes items_count without loading all rows
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
