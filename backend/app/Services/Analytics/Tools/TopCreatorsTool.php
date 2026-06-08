<?php

namespace App\Services\Analytics\Tools;

use App\Models\User;

/**
 * Top creators ranked by followers, views, posts, or engagement.
 */
class TopCreatorsTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_top_creators';
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
        $filters = (array) ($params['filters'] ?? []);
        $sortBy  = (string) ($filters['sort_by'] ?? 'followers');
        $limit   = (int) ($params['limit'] ?? 10);

        $sortColumn = match ($sortBy) {
            'views'       => 'total_views',
            'posts'       => 'posts_count',
            'engagement'  => 'engagement_rate',
            default       => 'followers_count',
        };

        $creators = User::query()
            ->where('role', '!=', 'super_admin')
            ->orderByDesc($sortColumn)
            ->limit($limit)
            ->select(['id', 'uuid', 'username', 'followers_count'])
            ->get()
            ->map(fn ($user) => [
                'user_id'          => $user->id,
                'uuid'             => $user->uuid,
                'username'         => $user->username,
                'followers_count'  => (int) $user->followers_count,
            ])
            ->toArray();

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => ['creators' => $creators, 'sort_by' => $sortBy],
            'compare'    => null,
            'change_pct' => null,
        ];
    }
}
