<?php

namespace App\Repositories;

use App\Models\AiContentCalendarItem;

/**
 * @extends BaseRepository<AiContentCalendarItem>
 */
class AiContentCalendarItemRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new AiContentCalendarItem());
    }

    public function findByUuidAndUserOrFail(string $uuid, int $userId): AiContentCalendarItem
    {
        /** @var AiContentCalendarItem */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function findByCalendar(int $calendarId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->query()
            ->where('calendar_id', $calendarId)
            ->orderBy('day_of_week')
            ->get();
    }
}
