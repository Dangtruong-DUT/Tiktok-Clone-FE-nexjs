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
        parent::__construct(new WellnessRule());
    }

    public function findByUuidAndUserOrFail(string $uuid, int $userId): WellnessRule
    {
        /** @var WellnessRule */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

    public function getForUser(int $userId): Collection
    {
        return $this->query()
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get();
    }

    public function getEnabledForUser(int $userId): Collection
    {
        return $this->query()
            ->where('user_id', $userId)
            ->where('is_enabled', true)
            ->get();
    }

    public function countForUser(int $userId): int
    {
        return $this->query()->where('user_id', $userId)->count();
    }
}
