<?php

namespace App\Services\Analytics\Tools;

use Illuminate\Support\Facades\DB;

/**
 * Overall system health: pending appeals, failed encodings, active queue, AI success rate.
 */
class SystemHealthTool extends AbstractAnalyticsTool
{
    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_system_health';
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
        $pendingAppeals  = DB::table('appeals')->where('status', 'pending')->count();
        $failedEncoding  = DB::table('video_encodings')->where('status', 3)->count();
        $activeEncoding  = DB::table('video_encodings')->whereIn('status', [0, 1])->count();

        $range = $this->resolveDateRange($params['period'] ?? 'today');

        $aiTotal   = DB::table('ai_usage_logs')->whereBetween('created_at', [$range['from'], $range['to']])->count();
        $aiSuccess = DB::table('ai_usage_logs')->whereBetween('created_at', [$range['from'], $range['to']])->where('status', 'success')->count();
        $aiRate    = $aiTotal > 0 ? round($aiSuccess / $aiTotal * 100, 1) : null;

        $data = [
            'pending_appeals'  => $pendingAppeals,
            'failed_encodings' => $failedEncoding,
            'active_queue'     => $activeEncoding,
            'ai_success_rate'  => $aiRate,
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
