<?php

namespace App\Services\Analytics\Tools;

use App\Models\Post;

/**
 * Post breakdown by status: published/hidden/draft/scheduled/deleted.
 * Includes hidden reason breakdown.
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

        if (isset($params['user_id']) && $isAdmin) {
            $base->where('user_id', $params['user_id']);
        }

        if (isset($filters['reason'])) {
            $base->where('hidden_reason', $filters['reason']);
        }

        if (isset($filters['moderation_reason'])) {
            $base->where('moderation_reason', $filters['moderation_reason']);
        }

        if (isset($filters['category'])) {
            $base->where('category', $filters['category']);
        }

        $breakdown = (clone $base)
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        $hiddenReason = (clone $base)
            ->where('status', 'hidden')
            ->whereNotNull('hidden_reason')
            ->selectRaw('hidden_reason, COUNT(*) as cnt')
            ->groupBy('hidden_reason')
            ->pluck('cnt', 'hidden_reason')
            ->toArray();

        $data = [
            'status_breakdown'       => $breakdown,
            'hidden_reason_breakdown' => $hiddenReason,
            'total'                  => array_sum($breakdown),
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
