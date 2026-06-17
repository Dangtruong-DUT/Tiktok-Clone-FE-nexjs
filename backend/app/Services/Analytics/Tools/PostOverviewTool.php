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

        if ($isAdmin && isset($params['user_id'])) {
            $query->where('user_id', $params['user_id']);
        } elseif ($isAdmin && isset($filters['creator_id'])) {
            $query->where('user_id', $filters['creator_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $total      = (clone $query)->count();
        $published  = (clone $query)->where('status', 'published')->count();
        $draft      = (clone $query)->where('status', 'draft')->count();
        $scheduled  = (clone $query)->where('status', 'scheduled')->count();
        $hidden     = (clone $query)->where('status', 'hidden')->count();

        $audienceMap  = [0 => 'public', 1 => 'private', 2 => 'friends', 3 => 'following'];
        $audienceRows = (clone $query)
            ->selectRaw('audience, COUNT(*) as cnt')
            ->groupBy('audience')
            ->pluck('cnt', 'audience')
            ->toArray();
        $audienceBreakdown = [];
        foreach ($audienceRows as $val => $cnt) {
            $audienceBreakdown[$audienceMap[(int) $val] ?? (string) $val] = (int) $cnt;
        }

        $data = [
            'total_posts'        => $total,
            'published_posts'    => $published,
            'draft_posts'        => $draft,
            'scheduled_posts'    => $scheduled,
            'hidden_posts'       => $hidden,
            'audience_breakdown' => $audienceBreakdown,
        ];

        if (isset($params['limit'])) {
            $data['items'] = (clone $query)
                ->orderByDesc('created_at')
                ->limit((int) $params['limit'])
                ->select(['uuid', 'content', 'status', 'published_at', 'created_at'])
                ->get()
                ->map(fn ($p) => [
                    'uuid'            => $p->uuid,
                    'content_excerpt' => mb_substr((string) $p->content, 0, 80),
                    'status'          => $p->status,
                    'published_at'    => $p->published_at,
                    'created_at'      => $p->created_at,
                ])
                ->toArray();
        }

        $compare    = null;
        $changePct  = null;

        if (isset($params['compare_with'])) {
            $compareRange = $this->resolveDateRange($params['compare_with']);
            $prevQuery    = Post::query()->whereBetween('created_at', [$compareRange['from'], $compareRange['to']]);

            if (! $isAdmin && $userId !== null) {
                $prevQuery->where('user_id', $userId);
            } elseif ($isAdmin && isset($params['user_id'])) {
                $prevQuery->where('user_id', $params['user_id']);
            } elseif ($isAdmin && isset($filters['creator_id'])) {
                $prevQuery->where('user_id', $filters['creator_id']);
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
