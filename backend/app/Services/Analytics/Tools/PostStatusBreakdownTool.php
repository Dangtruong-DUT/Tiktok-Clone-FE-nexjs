<?php

namespace App\Services\Analytics\Tools;

use App\Models\Post;

/**
 * Post breakdown by status: published/hidden/draft/scheduled/deleted.
 */
class PostStatusBreakdownTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_post_status_breakdown';
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

        $base = Post::query()->whereBetween('created_at', [$range['from'], $range['to']]);

        if (! $isAdmin && $userId !== null) {
            $base->where('user_id', $userId);
        }

        if ($isAdmin && isset($params['user_id'])) {
            $base->where('user_id', $params['user_id']);
        } elseif ($isAdmin && isset($filters['creator_id'])) {
            $base->where('user_id', $filters['creator_id']);
        }

        $breakdown = (clone $base)
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        $data = [
            'status_breakdown' => $breakdown,
            'total'            => array_sum($breakdown),
        ];

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => $data,
            'compare'    => null,
            'change_pct' => null,
        ];
    }
}
