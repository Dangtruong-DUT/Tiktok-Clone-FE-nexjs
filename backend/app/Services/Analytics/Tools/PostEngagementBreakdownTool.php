<?php

namespace App\Services\Analytics\Tools;

use App\Models\Post;

/**
 * Total views, likes, comments, shares, bookmarks and engagement rate.
 */
class PostEngagementBreakdownTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_post_engagement_breakdown';
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
            ->where('status', 'published')
            ->whereBetween('created_at', [$range['from'], $range['to']]);

        if (! $isAdmin && $userId !== null) {
            $query->where('user_id', $userId);
        }

        if ($isAdmin && isset($params['user_id'])) {
            $query->where('user_id', $params['user_id']);
        } elseif ($isAdmin && isset($filters['creator_id'])) {
            $query->where('user_id', $filters['creator_id']);
        }

        $agg = (clone $query)->selectRaw(
            'COALESCE(SUM(user_views + guest_views), 0) as total_views,
             COALESCE(SUM(likes_count), 0) as total_likes,
             COALESCE(SUM(comments_count), 0) as total_comments,
             COALESCE(SUM(share_count), 0) as total_shares,
             COALESCE(SUM(bookmarks_count), 0) as total_bookmarks,
             COUNT(*) as post_count'
        )->first();

        $postCount = (int) ($agg->post_count ?? 0);
        $totalViews = (int) ($agg->total_views ?? 0);
        $totalLikes = (int) ($agg->total_likes ?? 0);

        $engagementRate = $postCount > 0 && $totalViews > 0
            ? round(($totalLikes + (int) ($agg->total_comments ?? 0)) / $totalViews * 100, 2)
            : 0.0;

        $typeMap      = [0 => 'post', 1 => 'repost', 2 => 'comment', 3 => 'quote_post'];
        $typeRows     = (clone $query)
            ->selectRaw('type, COUNT(*) as cnt, COALESCE(SUM(user_views + guest_views), 0) as views, COALESCE(SUM(likes_count), 0) as likes')
            ->groupBy('type')
            ->get();
        $byTypeBreakdown = [];
        foreach ($typeRows as $row) {
            $label = $typeMap[(int) $row->type] ?? (string) $row->type;
            $byTypeBreakdown[$label] = [
                'count' => (int) $row->cnt,
                'views' => (int) $row->views,
                'likes' => (int) $row->likes,
            ];
        }

        $data = [
            'total_views'        => $totalViews,
            'total_likes'        => $totalLikes,
            'total_comments'     => (int) ($agg->total_comments ?? 0),
            'total_shares'       => (int) ($agg->total_shares ?? 0),
            'total_bookmarks'    => (int) ($agg->total_bookmarks ?? 0),
            'engagement_rate'    => $engagementRate,
            'by_type_breakdown'  => $byTypeBreakdown,
        ];

        $compare   = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr = $this->resolveDateRange($params['compare_with']);
            $pq = Post::query()->where('status', 'published')->whereBetween('created_at', [$cr['from'], $cr['to']]);

            if (! $isAdmin && $userId !== null) {
                $pq->where('user_id', $userId);
            } elseif ($isAdmin && isset($params['user_id'])) {
                $pq->where('user_id', $params['user_id']);
            } elseif ($isAdmin && isset($filters['creator_id'])) {
                $pq->where('user_id', $filters['creator_id']);
            }

            $prevAgg  = $pq->selectRaw('COALESCE(SUM(user_views + guest_views), 0) as total_views')->first();
            $prevViews = (int) ($prevAgg->total_views ?? 0);
            $compare   = ['total_views' => $prevViews];
            $changePct = $this->changePercent($totalViews, $prevViews);
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
