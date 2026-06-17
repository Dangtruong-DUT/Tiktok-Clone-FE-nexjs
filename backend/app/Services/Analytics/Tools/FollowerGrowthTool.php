<?php

namespace App\Services\Analytics\Tools;

use App\Enums\User\RelationshipTypeEnum;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Follower count, new followers gained, net growth for the creator.
 * Note: unfollows cannot be tracked — the `relationships` table has no soft deletes.
 */
class FollowerGrowthTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_follower_growth';
    }

    /**
     * @return bool
     */
    public function adminOnly(): bool
    {
        return false;
    }

    /**
     * @param  array<string,mixed>  $params
     * @param  int|null  $userId
     * @param  bool      $isAdmin
     * @return array{tool: string, period: string, data: array<string,mixed>, compare: array<string,mixed>|null, change_pct: float|null}
     */
    public function run(array $params, ?int $userId, bool $isAdmin): array
    {
        $range = $this->resolveDateRange($params['period']);

        if ($userId === null) {
            return ['tool' => $this->name(), 'period' => $params['period'], 'data' => [], 'compare' => null, 'change_pct' => null];
        }

        // Use the denormalized counter on the user row for current total — more accurate
        // than querying relationships directly, as it's kept in sync by the follow service.
        $totalFollowers = (int) (User::find($userId)?->followers_count ?? 0);

        // New follows created within the period
        $newFollowers = DB::table('relationships')
            ->where('target_user_id', $userId)
            ->where('type', RelationshipTypeEnum::FOLLOW->value)
            ->whereBetween('created_at', [$range['from'], $range['to']])
            ->count();

        $data = [
            'total_followers' => $totalFollowers,
            'new_followers'   => $newFollowers,
            // unfollows is not trackable: relationships table has no soft deletes
            'net_growth'      => $newFollowers,
        ];

        $compare   = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr = $this->resolveDateRange($params['compare_with']);
            $prevNew = DB::table('relationships')
                ->where('target_user_id', $userId)
                ->where('type', RelationshipTypeEnum::FOLLOW->value)
                ->whereBetween('created_at', [$cr['from'], $cr['to']])
                ->count();
            $compare   = ['new_followers' => $prevNew];
            $changePct = $this->changePercent($newFollowers, $prevNew);
        }

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => $data,
            'compare'    => $compare,
            'change_pct' => $changePct,
        ];
    }
}
