<?php

namespace App\Services\Analytics\Tools;

use App\Models\User;

/**
 * Platform-wide user growth: new users, active users, ban rate, daily trend.
 */
class UserGrowthTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_user_growth';
    }

    /**
     * @return bool
     */
    public function adminOnly(): bool
    {
        return true;
    }

    /**
     * @param  array<string,mixed>  $params
     * @param  int|null  $userId
     * @param  bool      $isAdmin
     * @return array{tool: string, period: string, data: array<string,mixed>, compare: array<string,mixed>|null, change_pct: float|null}
     */
    public function run(array $params, ?int $userId, bool $isAdmin): array
    {
        $range   = $this->resolveDateRange($params['period']);
        $filters = (array) ($params['filters'] ?? []);

        $base = User::query()->whereBetween('created_at', [$range['from'], $range['to']]);

        if (isset($filters['role'])) {
            $base->where('role', $filters['role']);
        }

        $totalUsers  = User::query()->count();
        $newUsers    = (clone $base)->count();
        $bannedUsers = User::query()->whereNotNull('banned_at')->count();

        $dailySeries = $this->buildDailySeries($range['from'], $range['to']);
        $dailyRows   = User::query()
            ->whereBetween('created_at', [$range['from'], $range['to']])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as cnt')
            ->groupByRaw('DATE(created_at)')
            ->pluck('cnt', 'date')
            ->toArray();

        foreach ($dailyRows as $date => $cnt) {
            if (isset($dailySeries[$date])) {
                $dailySeries[$date] = (int) $cnt;
            }
        }

        $data = [
            'total_users'    => $totalUsers,
            'new_users'      => $newUsers,
            'banned_users'   => $bannedUsers,
            'daily_series'   => $dailySeries,
        ];

        $compare   = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr       = $this->resolveDateRange($params['compare_with']);
            $prevNew  = User::query()->whereBetween('created_at', [$cr['from'], $cr['to']])->count();
            $compare  = ['new_users' => $prevNew];
            $changePct = $this->changePercent($newUsers, $prevNew);
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
