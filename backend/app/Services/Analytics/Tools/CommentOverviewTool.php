<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

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

        $query = DB::table('comments')
            ->whereNull('deleted_at')
            ->whereBetween('created_at', [$range['from'], $range['to']]);

        if (! $isAdmin && $userId !== null) {
            $query->whereIn('post_id', function ($sub) use ($userId) {
                $sub->select('id')->from('posts')->where('user_id', $userId)->whereNull('deleted_at');
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $total  = (clone $query)->count();
        $toxic  = (clone $query)->where('is_toxic', true)->count();

        $compare   = null;
        $changePct = null;

        if (isset($params['compare_with'])) {
            $cr = $this->resolveDateRange($params['compare_with']);
            $pq = DB::table('comments')->whereNull('deleted_at')->whereBetween('created_at', [$cr['from'], $cr['to']]);

            if (! $isAdmin && $userId !== null) {
                $pq->whereIn('post_id', function ($sub) use ($userId) {
                    $sub->select('id')->from('posts')->where('user_id', $userId)->whereNull('deleted_at');
                });
            }

            $prevTotal = $pq->count();
            $compare   = ['total_comments' => $prevTotal];
            $changePct = $this->changePercent($total, $prevTotal);
        }

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => ['total_comments' => $total, 'toxic_comments' => $toxic],
            'compare'    => $compare,
            'change_pct' => $changePct,
        ];
    }
}
