<?php

namespace App\Services\Analytics;

/**
 * Reads config/analytics.php and exposes catalog lookups for tools and periods.
 * Used by the Planner (tool discovery) and Executor (validation).
 */
class MetricsCatalog
{
    /**
     * Return all tool definitions visible to the given scope.
     *
     * @param  string  $scope  One of: creator, admin, system, public
     * @return array<string, array<string, mixed>>
     */
    public function toolsForScope(string $scope): array
    {
        $all = config('analytics.tools', []);

        return array_filter($all, fn (array $tool) => in_array($scope, $tool['scopes'] ?? [], true));
    }

    /**
     * Return a single tool definition by tool name.
     *
     * @param  string  $toolName  e.g. 'get_post_overview'
     * @return array<string, mixed>|null
     */
    public function tool(string $toolName): ?array
    {
        return config("analytics.tools.{$toolName}");
    }

    /**
     * Check whether a tool name exists in the catalog.
     *
     * @param  string  $toolName
     * @return bool
     */
    public function exists(string $toolName): bool
    {
        return config("analytics.tools.{$toolName}") !== null;
    }

    /**
     * Check whether a tool requires super_admin role.
     *
     * @param  string  $toolName
     * @return bool
     */
    public function isAdminOnly(string $toolName): bool
    {
        return (bool) config("analytics.tools.{$toolName}.admin_only", false);
    }

    /**
     * Return all valid period strings from config.
     *
     * @return list<string>
     */
    public function validPeriods(): array
    {
        return (array) config('analytics.periods', []);
    }

    /**
     * Build the tool description block injected into the Planner prompt.
     * Only includes tools visible to the given scope.
     *
     * @param  string  $scope
     * @return string
     */
    public function buildToolsContext(string $scope): string
    {
        $tools = $this->toolsForScope($scope);

        if (empty($tools)) {
            return 'No tools available.';
        }

        $lines = [];

        foreach ($tools as $name => $def) {
            $description    = $def['description'] ?? '';
            $requiredParams = implode(', ', $def['required_params'] ?? []);
            $optionalParams = implode(', ', $def['optional_params'] ?? []);
            $allowedFilters = implode(', ', $def['allowed_filters'] ?? []);
            $metrics        = implode(', ', $def['metrics'] ?? []);

            $line = "- {$name}: {$description}";
            if ($requiredParams) {
                $line .= " | required: {$requiredParams}";
            }
            if ($optionalParams) {
                $line .= " | optional: {$optionalParams}";
            }
            if ($allowedFilters) {
                $line .= " | filters: {$allowedFilters}";
            }
            if ($metrics) {
                $line .= " | metrics: {$metrics}";
            }

            $lines[] = $line;
        }

        return implode("\n", $lines);
    }
}
