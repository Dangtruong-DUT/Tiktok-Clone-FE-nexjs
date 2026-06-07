<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Admin action counts by type (ban, unban, delete post, approve appeal, etc.) in period.
 */
class AdminAuditLogsTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_admin_audit_logs';
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
        $range   = $this->resolveDateRange($params['period']);
        $filters = (array) ($params['filters'] ?? []);

        $query = DB::table('admin_audit_logs')
            ->whereBetween('created_at', [$range['from'], $range['to']]);

        if (isset($filters['action_type'])) {
            $query->where('action', $filters['action_type']);
        }

        if (isset($filters['admin_id'])) {
            $query->where('admin_id', $filters['admin_id']);
        }

        if (isset($filters['resource_type'])) {
            $query->where('resource_type', $filters['resource_type']);
        }

        $total = (clone $query)->count();

        $actionBreakdown = (clone $query)
            ->selectRaw('action, COUNT(*) as cnt')
            ->groupBy('action')
            ->orderByDesc('cnt')
            ->pluck('cnt', 'action')
            ->toArray();

        $topAdmins = (clone $query)
            ->selectRaw('admin_id, COUNT(*) as cnt')
            ->groupBy('admin_id')
            ->orderByDesc('cnt')
            ->limit(5)
            ->pluck('cnt', 'admin_id')
            ->toArray();

        $data = [
            'total_actions'    => $total,
            'action_breakdown' => $actionBreakdown,
            'top_admins'       => $topAdmins,
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
