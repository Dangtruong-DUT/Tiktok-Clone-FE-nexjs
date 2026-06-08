<?php

namespace App\Services\Analytics\Tools;

use App\Enums\Appeal\AppealStatusEnum;
use App\Repositories\AppealRepository;

/**
 * Appeal SLA metrics: oldest pending age, average resolution time, backlog count.
 */
class AppealSlaTool extends AbstractAnalyticsTool
{
    public function __construct(private readonly AppealRepository $appealRepo) {}

    /**
     * @return string
     */
    public function name(): string
    {
        return 'get_appeal_sla_metrics';
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
        $pendingCount = $this->appealRepo->countByStatus(AppealStatusEnum::PENDING);

        $oldestPending = $this->appealRepo->getOldestCreatedAt(AppealStatusEnum::PENDING);
        $oldestDays    = $oldestPending ? (int) now()->diffInDays($oldestPending) : null;

        $avgResolutionHours = $this->appealRepo->getAvgResolutionHours([
            AppealStatusEnum::APPROVED,
            AppealStatusEnum::REJECTED,
        ]);

        $data = [
            'pending_count'        => $pendingCount,
            'oldest_pending_days'  => $oldestDays,
            'avg_resolution_hours' => $avgResolutionHours,
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
