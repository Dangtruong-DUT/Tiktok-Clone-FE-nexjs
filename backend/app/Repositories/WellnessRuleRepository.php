<?php

namespace App\Repositories;

use App\Models\WellnessRule;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<WellnessRule>
 */
class WellnessRuleRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(WellnessRule::class));
    }

    /**
     * Find a wellness rule by UUID for a user or fail.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return WellnessRule
     */
    public function findByUuidAndUserOrFail(string $uuid, int $userId): WellnessRule
    {
        /** @var WellnessRule */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    /**
     * Get all wellness rules for a user.
     *
     * @param  int  $userId
     * @return Collection<int, WellnessRule>
     */
    public function getForUser(int $userId): Collection
    {
        return $this->query()
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Get enabled wellness rules for a user.
     *
     * @param  int  $userId
     * @return Collection<int, WellnessRule>
     */
    public function getEnabledForUser(int $userId): Collection
    {
        return $this->query()
            ->where('user_id', $userId)
            ->where('is_enabled', true)
            ->get();
    }

    /**
     * Count wellness rules for a user.
     *
     * @param  int  $userId
     * @return int
     */
    public function countForUser(int $userId): int
    {
        return $this->query()->where('user_id', $userId)->count();
    }
}
