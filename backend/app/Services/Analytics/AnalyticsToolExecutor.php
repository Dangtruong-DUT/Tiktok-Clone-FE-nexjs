<?php

namespace App\Services\Analytics;

use App\Services\Analytics\Tools\Contracts\AnalyticsToolInterface;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Resolves, validates, and executes analytics tools from a Planner-generated plan.
 * Handles role-based filtering, param validation, and result caching.
 */
class AnalyticsToolExecutor
{
    /**
     * @param  MetricsCatalog  $catalog
     */
    public function __construct(
        private readonly MetricsCatalog $catalog,
    ) {}

    /**
     * Execute all tools from the plan and return keyed results.
     *
     * @param  list<array{tool_name: string, params: array<string,mixed>}>  $toolPlan
     * @param  string    $scope    Resolved from GatewayTask
     * @param  string    $subject  Resolved from GatewayTask
     * @param  int|null  $userId   Current user's ID (null for anonymous/admin platform queries)
     * @param  bool      $isAdmin
     * @return array<string, array<string,mixed>>  Keyed by tool_name
     */
    public function execute(
        array   $toolPlan,
        string  $scope,
        string  $subject,
        ?int    $userId,
        bool    $isAdmin,
    ): array {
        $results = [];

        foreach ($toolPlan as $entry) {
            $toolName = (string) ($entry['tool_name'] ?? '');
            $params   = (array)  ($entry['params'] ?? []);

            $toolDef = $this->catalog->tool($toolName);

            if ($toolDef === null) {
                Log::warning("AnalyticsToolExecutor: unknown tool '{$toolName}'");
                continue;
            }

            if (($toolDef['admin_only'] ?? false) && ! $isAdmin) {
                Log::debug("AnalyticsToolExecutor: skipping admin-only tool '{$toolName}' for non-admin");
                continue;
            }

            $cacheKey = $this->buildCacheKey($toolName, $scope, $subject, $userId, $params);
            $ttl      = (int) config("analytics.cache.ttl.{$scope}", 60);

            try {
                $result = ($toolDef['cacheable'] ?? true)
                    ? Cache::remember($cacheKey, $ttl, fn () => $this->runTool($toolDef['class'], $params, $userId, $isAdmin))
                    : $this->runTool($toolDef['class'], $params, $userId, $isAdmin);

                $results[$toolName] = $result;
            } catch (\Throwable $e) {
                Log::warning("AnalyticsToolExecutor: tool '{$toolName}' failed", ['error' => $e->getMessage()]);
            }
        }

        return $results;
    }

    /**
     * Instantiate and run a tool class.
     *
     * @param  class-string  $class
     * @param  array<string,mixed>  $params
     * @param  int|null  $userId
     * @param  bool      $isAdmin
     * @return array<string,mixed>
     */
    private function runTool(string $class, array $params, ?int $userId, bool $isAdmin): array
    {
        /** @var AnalyticsToolInterface $tool */
        $tool = App::make($class);

        return $tool->run($params, $userId, $isAdmin);
    }

    /**
     * Build a deterministic cache key for a tool execution.
     * Format: analytics:{tool}:{scope}:{subject}:{user_id|platform}:{period}:{md5(json(params))}
     *
     * @param  string  $toolName
     * @param  string  $scope
     * @param  string  $subject
     * @param  int|null  $userId
     * @param  array<string,mixed>  $params
     * @return string
     */
    private function buildCacheKey(
        string $toolName,
        string $scope,
        string $subject,
        ?int   $userId,
        array  $params,
    ): string {
        $userSegment = ($userId !== null && $scope === 'creator') ? (string) $userId : 'platform';
        $period      = (string) ($params['period'] ?? 'unknown');
        $paramsHash  = md5(json_encode($params, JSON_UNESCAPED_UNICODE) ?: '');

        return "analytics:{$toolName}:{$scope}:{$subject}:{$userSegment}:{$period}:{$paramsHash}";
    }
}
