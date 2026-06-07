<?php

namespace App\Services\Analytics\Tools\Contracts;

interface AnalyticsToolInterface
{
    /**
     * Return the tool's registered name (matches config/analytics.php key).
     *
     * @return string
     */
    public function name(): string;

    /**
     * Execute the tool and return structured results.
     *
     * @param  array<string,mixed>  $params  Validated params from the Planner plan
     * @param  int|null  $userId             Current user's ID (for creator-scoped queries)
     * @param  bool      $isAdmin            Whether the requesting user has super_admin role
     * @return array{tool: string, period: string, data: array<string,mixed>, compare: array<string,mixed>|null, change_pct: float|null}
     */
    public function run(array $params, ?int $userId, bool $isAdmin): array;

    /**
     * Check whether this tool requires super_admin role.
     *
     * @return bool
     */
    public function adminOnly(): bool;
}
