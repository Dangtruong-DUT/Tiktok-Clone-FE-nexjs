<?php

namespace App\Services\Analytics\Tools;

use App\Models\Post;

/**
 * Post count by status with growth comparison.
 */
class PostOverviewTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_post_overview';
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
        $range   = $this->resolveDateRange($params['period']);
        $filters = (array) ($params['filters'] ?? []);

        $query = Post::query()
            ->whereBetween('created_at', [$range['from'], $range['to']]);

        if (! $isAdmin && $userId !== null) {
            $query->where('user_id', $userId);
        }

        if (isset($params['user_id']) && $isAdmin) {
            $query->where('user_id', $params['user_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        $total      = (clone $query)->count();
        $published  = (clone $query)->where('status', 'published')->count();
        $hidden     = (clone $query)->where('status', 'hidden')->count();
        $draft      = (clone $query)->where('status', 'draft')->count();
        $scheduled  = (clone $query)->where('status', 'scheduled')->count();

        $data = [
            'total_posts'     => $total,
            'published_posts' => $published,
            'hidden_posts'    => $hidden,
            'draft_posts'     => $draft,
            'scheduled_posts' => $scheduled,
        ];

        $compare    = null;
        $changePct  = null;

        if (isset($params['compare_with'])) {
            $compareRange = $this->resolveDateRange($params['compare_with']);
            $prevQuery    = Post::query()->whereBetween('created_at', [$compareRange['from'], $compareRange['to']]);

            if (! $isAdmin && $userId !== null) {
                $prevQuery->where('user_id', $userId);
            }

            $prevTotal = $prevQuery->count();
            $compare   = ['total_posts' => $prevTotal];
            $changePct = $this->changePercent($total, $prevTotal);
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
