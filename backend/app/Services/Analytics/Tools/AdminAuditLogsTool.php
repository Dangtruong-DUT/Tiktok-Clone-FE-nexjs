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

        $query = DB::table('admin_logs')
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

        $resourceBreakdown = (clone $query)
            ->whereNotNull('resource_type')
            ->selectRaw('resource_type, COUNT(*) as cnt')
            ->groupBy('resource_type')
            ->orderByDesc('cnt')
            ->pluck('cnt', 'resource_type')
            ->toArray();

        $data = [
            'total_actions'      => $total,
            'action_breakdown'   => $actionBreakdown,
            'top_admins'         => $topAdmins,
            'resource_breakdown' => $resourceBreakdown,
        ];

        if (isset($params['limit'])) {
            $data['items'] = (clone $query)
                ->join('users', 'admin_logs.admin_id', '=', 'users.id')
                ->orderByDesc('admin_logs.created_at')
                ->limit((int) $params['limit'])
                ->select([
                    'admin_logs.action',
                    'users.username as admin_username',
                    'admin_logs.resource_type',
                    'admin_logs.resource_id',
                    'admin_logs.created_at',
                ])
                ->get()
                ->map(fn ($r) => [
                    'action'         => $r->action,
                    'admin_username' => $r->admin_username,
                    'resource_type'  => $r->resource_type,
                    'resource_id'    => $r->resource_id,
                    'created_at'     => $r->created_at,
                ])
                ->toArray();
        }

        return [
            'tool'       => $this->name(),
            'period'     => $params['period'],
            'data'       => $data,
            'compare'    => null,
            'change_pct' => null,
        ];
    }
}
