<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Follower count, new followers gained, unfollows, net growth for the creator.
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

        $totalFollowers = DB::table('followers')
            ->where('following_id', $userId)
            ->whereNull('deleted_at')
            ->count();

        $newFollowers = DB::table('followers')
            ->where('following_id', $userId)
            ->whereBetween('created_at', [$range['from'], $range['to']])
            ->count();

        $unfollows = DB::table('followers')
            ->where('following_id', $userId)
            ->whereBetween('deleted_at', [$range['from'], $range['to']])
            ->count();

        $data = [
            'total_followers' => $totalFollowers,
            'new_followers'   => $newFollowers,
            'unfollows'       => $unfollows,
            'net_growth'      => $newFollowers - $unfollows,
        ];

        $compare   = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr = $this->resolveDateRange($params['compare_with']);
            $prevNew = DB::table('followers')
                ->where('following_id', $userId)
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
