<?php

namespace App\Services\Analytics\Tools;

use App\Enums\Post\PostTypeEnum;
use App\Models\Post;

/**
 * Total comments, comment growth, and toxic comment count.
 */
class CommentOverviewTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_comment_overview';
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
            ->where('type', PostTypeEnum::COMMENT->value)
            ->whereNotNull('parent_id')
            ->whereBetween('created_at', [$range['from'], $range['to']]);

        $ownerId = ! $isAdmin ? $userId : ($params['user_id'] ?? $filters['creator_id'] ?? null);
        if ($ownerId !== null) {
            $query->whereIn('parent_id', function ($sub) use ($ownerId) {
                $sub->select('id')->from('posts')->where('user_id', (int) $ownerId)->whereNull('deleted_at');
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $total = (clone $query)->count();

        $listItems = null;
        if (isset($params['limit'])) {
            $listItems = (clone $query)
                ->join('users', 'posts.user_id', '=', 'users.id')
                ->orderByDesc('posts.created_at')
                ->limit((int) $params['limit'])
                ->select(['posts.uuid', 'posts.content', 'posts.parent_id', 'users.username', 'posts.created_at'])
                ->get()
                ->map(fn ($c) => [
                    'uuid'            => $c->uuid,
                    'content_excerpt' => mb_substr((string) $c->content, 0, 80),
                    'post_id'         => $c->parent_id,
                    'username'        => $c->username,
                    'created_at'      => $c->created_at,
                ])
                ->toArray();
        }

        $compare   = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr = $this->resolveDateRange($params['compare_with']);
            $pq = Post::query()
                ->where('type', PostTypeEnum::COMMENT->value)
                ->whereNotNull('parent_id')
                ->whereBetween('created_at', [$cr['from'], $cr['to']]);

            if ($ownerId !== null) {
                $pq->whereIn('parent_id', function ($sub) use ($ownerId) {
                    $sub->select('id')->from('posts')->where('user_id', (int) $ownerId)->whereNull('deleted_at');
                });
            }

            $prevTotal = $pq->count();
            $compare   = ['total_comments' => $prevTotal];
            $changePct = $this->changePercent($total, $prevTotal);
        }

        $data = ['total_comments' => $total];
        if ($listItems !== null) {
            $data['items'] = $listItems;
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
