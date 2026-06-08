<?php

namespace App\Services\Analytics\Tools;

use App\Models\Post;

/**
 * Top videos ranked by views, likes, comments, shares, or engagement rate.
 */
class TopVideosTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_top_videos';
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
        $sortBy  = (string) ($filters['sort_by'] ?? 'views');
        $limit   = (int) ($params['limit'] ?? 10);

        $sortColumn = match ($sortBy) {
            'likes'    => 'likes_count',
            'comments' => 'comments_count',
            'shares'   => 'share_count',
            default    => 'user_views',
        };

        $query = Post::query()
            ->where('status', 'published')
            ->whereBetween('created_at', [$range['from'], $range['to']])
            ->orderByDesc($sortColumn)
            ->limit($limit);

        if (! $isAdmin && $userId !== null) {
            $query->where('user_id', $userId);
        }

        if ($isAdmin && isset($params['user_id'])) {
            $query->where('user_id', $params['user_id']);
        } elseif ($isAdmin && isset($filters['creator_id'])) {
            $query->where('user_id', $filters['creator_id']);
        }

        $posts = $query->select(['id', 'uuid', 'content', 'user_views', 'guest_views', 'likes_count', 'comments_count', 'share_count'])->get();

        $videos = $posts->map(fn ($post) => [
            'post_uuid'      => $post->uuid,
            'title'          => mb_substr((string) $post->content, 0, 80),
            'views'          => (int) $post->user_views + (int) $post->guest_views,
            'likes'          => (int) $post->likes_count,
            'comments'       => (int) $post->comments_count,
            'shares'         => (int) $post->share_count,
            'engagement_rate' => ((int) $post->user_views + (int) $post->guest_views) > 0
                ? round(((int) $post->likes_count + (int) $post->comments_count) / ((int) $post->user_views + (int) $post->guest_views) * 100, 2)
                : 0.0,
        ])->values()->toArray();

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => ['videos' => $videos, 'sort_by' => $sortBy],
            'compare'    => null,
            'change_pct' => null,
        ];
    }
}
