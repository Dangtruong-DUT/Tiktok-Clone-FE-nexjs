<?php

namespace App\Services\Analytics\Tools;

use App\Models\User;

/**
 * Personal account overview: profile and core creator stats.
 */
class AccountOverviewTool extends AbstractAnalyticsTool
{
    public function name(): string
    {
        return 'get_account_overview';
    }

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
        $range = $this->resolveDateRange((string) ($params['period'] ?? 'current_month'));

        if ($userId === null) {
            return [
                'tool'       => $this->name(),
                'period'     => (string) ($params['period'] ?? 'current_month'),
                'data'       => [],
                'compare'    => null,
                'change_pct' => null,
            ];
        }

        $user = User::query()->find($userId);

        if ($user === null) {
            return [
                'tool'       => $this->name(),
                'period'     => (string) ($params['period'] ?? 'current_month'),
                'data'       => [],
                'compare'    => null,
                'change_pct' => null,
            ];
        }

        $totalPosts = $user->posts()->count();
        $periodPosts = $user->posts()
            ->whereBetween('created_at', [$range['from'], $range['to']])
            ->count();

        $data = [
            'user_id'          => $user->id,
            'uuid'             => $user->uuid,
            'username'         => $user->username,
            'name'             => $user->name,
            'followers_count'  => (int) $user->followers_count,
            'following_count'  => (int) $user->following_count,
            'total_posts'      => $totalPosts,
            'period_posts'     => $periodPosts,
            'is_verified'      => $user->isVerified(),
            'is_banned'        => $user->isBanned(),
            'ban_remaining_days' => $user->getBanRemainingDays(),
            'avatar_url'       => $user->avatar_url,
        ];

        $compare = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr = $this->resolveDateRange((string) $params['compare_with']);
            $prevPeriodPosts = $user->posts()
                ->whereBetween('created_at', [$cr['from'], $cr['to']])
                ->count();

            $compare = ['period_posts' => $prevPeriodPosts];
            $changePct = $this->changePercent($periodPosts, $prevPeriodPosts);
        }

        return [
            'tool'       => $this->name(),
            'period'     => (string) ($params['period'] ?? 'current_month'),
            'data'       => $data,
            'compare'    => $compare,
            'change_pct' => $changePct,
        ];
    }
}
