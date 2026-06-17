<?php

namespace App\Services\Analytics;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\Gemini\GeminiConfig;
use App\DTOs\AI\Gemini\GeminiRequest;
use App\Repositories\AiStudioSettingRepository;
use App\Repositories\AiPromptTemplateRepository;
use App\Services\AI\Copilot\Gateway\GatewayTask;
use Illuminate\Support\Facades\Log;

/**
 * Selects analytics tools from the catalog based on a GatewayTask.
 * Calls Gemini once with the available tool list injected into the prompt.
 * Validates the plan against the catalog before returning.
 */
class AnalyticsPlannerService
{
    private const PLANNER_INTENT = 'analytics_planner';

    /**
     * @param  GeminiClientInterface      $gemini
     * @param  AiPromptTemplateRepository $templateRepo
     * @param  MetricsCatalog             $catalog
     */
    public function __construct(
        private readonly GeminiClientInterface      $gemini,
        private readonly AiPromptTemplateRepository $templateRepo,
        private readonly MetricsCatalog             $catalog,
        private readonly AiStudioSettingRepository  $settingRepository,
    ) {}

    /**
     * Build a tool execution plan from the gateway task.
     * Returns a validated plan array; sets needs_clarification=true if no valid tools remain.
     *
     * @param  GatewayTask  $task
     * @param  bool         $isAdmin
     * @return array{
     *   tools: list<array{tool_name: string, params: array<string,mixed>}>,
     *   response_view: string,
     *   needs_clarification: bool,
     *   clarification_question: string|null
     * }
     */
    public function plan(GatewayTask $task, bool $isAdmin, string $question): array
    {
        $toolsContext = $this->catalog->buildToolsContext($task->scope);
        $periods      = implode(', ', $this->catalog->validPeriods());

        $template     = $this->templateRepo->findByIntent(self::PLANNER_INTENT);
        $systemPrompt = $template?->system_prompt ?? $this->defaultSystemPrompt($toolsContext, $periods);
        $userPrompt   = $this->buildUserPrompt($task, $question, $toolsContext, $periods, $template?->user_template);

        try {
            $result = $this->gemini->send(new GeminiRequest(
                systemPrompt: $systemPrompt,
                contents:     [['role' => 'user', 'parts' => [['text' => $userPrompt]]]],
                config:       GeminiConfig::fromSetting($this->settingRepository->current(), [
                    'temperature'      => 0.1,
                    'maxOutputTokens'  => 400,
                    'responseMimeType' => 'application/json',
                ]),
            ))->toArray();

            $clean = $this->stripCodeFences((string) ($result['text'] ?? ''));
            $plan  = json_decode(trim($clean), true);

            if (json_last_error() !== JSON_ERROR_NONE || ! is_array($plan)) {
                return $this->scopeDefaultPlan($isAdmin, $task);
            }

            return $this->validateAndFilter($plan, $isAdmin, $task);
        } catch (\Throwable $e) {
            Log::channel(config('ai.logging.channel', 'stack'))->warning('AnalyticsPlannerService failed', [
                'error' => $e->getMessage(),
            ]);

            return $this->scopeDefaultPlan($isAdmin, $task);
        }
    }

    /**
     * Validate the Gemini-generated plan against the tool catalog.
     * Filters out unknown tools, invalid periods, and admin-only tools for non-admins.
     * Falls back to scopeDefaultPlan when no valid tools remain.
     *
     * @param  array<string,mixed>  $raw
     * @param  bool        $isAdmin
     * @param  GatewayTask $task
     * @return array{tools: list<array{tool_name: string, params: array<string,mixed>}>, response_view: string, needs_clarification: bool, clarification_question: string|null}
     */
    private function validateAndFilter(array $raw, bool $isAdmin, GatewayTask $task): array
    {
        if ($raw['needs_clarification'] ?? false) {
            return $this->scopeDefaultPlan($isAdmin, $task);
        }

        $validTools    = [];
        $validPeriods  = $this->catalog->validPeriods();

        foreach ((array) ($raw['tools'] ?? []) as $entry) {
            $toolName = (string) ($entry['tool_name'] ?? '');
            $params   = (array)  ($entry['params'] ?? []);

            if (! $this->catalog->exists($toolName)) {
                Log::channel(config('ai.logging.channel', 'stack'))->debug("Planner returned unknown tool '{$toolName}', skipping");
                continue;
            }

            if ($this->catalog->isAdminOnly($toolName) && ! $isAdmin) {
                Log::channel(config('ai.logging.channel', 'stack'))->debug("Tool '{$toolName}' is admin_only but user is not admin, skipping");
                continue;
            }

            $period = (string) ($params['period'] ?? '');
            if ($period === '' || ! in_array($period, $validPeriods, true)) {
                $toolDef          = $this->catalog->tool($toolName) ?? [];
                $params['period'] = $toolDef['default_period'] ?? 'current_week';
            }

            $toolDef        = $this->catalog->tool($toolName) ?? [];
            $allowedFilters = (array) ($toolDef['allowed_filters'] ?? []);
            $rawFilters     = (array) ($params['filters'] ?? []);

            if (! empty($rawFilters) && ! empty($allowedFilters)) {
                $params['filters'] = array_intersect_key($rawFilters, array_flip($allowedFilters));
            }

            $validTools[] = ['tool_name' => $toolName, 'params' => $params];
        }

        if (empty($validTools)) {
            return $this->scopeDefaultPlan($isAdmin, $task);
        }

        return [
            'tools'                  => $validTools,
            'response_view'          => (string) ($raw['response_view'] ?? 'summary'),
            'needs_clarification'    => false,
            'clarification_question' => null,
        ];
    }

    /**
     * Return a plan without asking the user for clarification.
     * Priority: use gateway's intent hint if it maps to a known tool; otherwise use scope default.
     *
     * @return array{tools: list<array{tool_name: string, params: array<string,mixed>}>, response_view: string, needs_clarification: bool, clarification_question: null}
     */
    private function scopeDefaultPlan(bool $isAdmin, GatewayTask $task): array
    {
        $intentHint = $task->intent;

        if ($intentHint !== null && $this->catalog->exists($intentHint)) {
            if (! $this->catalog->isAdminOnly($intentHint) || $isAdmin) {
                return $this->buildFallbackToolPlan($intentHint, $task);
            }
        }

        $defaultTool = $isAdmin ? 'get_user_growth' : 'get_post_overview';
        $toolDef     = $this->catalog->tool($defaultTool) ?? [];

        return [
            'tools' => [[
                'tool_name' => $defaultTool,
                'params'    => ['period' => $toolDef['default_period'] ?? 'current_week'],
            ]],
            'response_view'          => 'summary_card',
            'needs_clarification'    => false,
            'clarification_question' => null,
        ];
    }

    /**
     * Build a single-tool plan from the gateway's intent hint + task context.
     *
     * @return array{tools: list<array{tool_name: string, params: array<string,mixed>}>, response_view: string, needs_clarification: bool, clarification_question: null}
     */
    private function buildFallbackToolPlan(string $toolName, GatewayTask $task): array
    {
        $toolDef      = $this->catalog->tool($toolName) ?? [];
        $validPeriods = $this->catalog->validPeriods();

        $period = ($task->period !== null && in_array($task->period, $validPeriods, true))
            ? $task->period
            : ($toolDef['default_period'] ?? 'current_week');

        $allowedFilters = (array) ($toolDef['allowed_filters'] ?? []);
        $taskFilters    = (array) ($task->filters ?? []);
        $filters        = ! empty($allowedFilters) && ! empty($taskFilters)
            ? array_intersect_key($taskFilters, array_flip($allowedFilters))
            : [];

        $params = ['period' => $period];
        if (! empty($filters)) {
            $params['filters'] = $filters;
        }
        if ($task->compareWith !== null) {
            $params['compare_with'] = $task->compareWith;
        }

        $hasBreakdown = str_contains($toolName, 'breakdown')
            || in_array($toolName, ['get_appeal_overview', 'get_post_overview', 'get_user_growth'], true);

        return [
            'tools' => [['tool_name' => $toolName, 'params' => $params]],
            'response_view'          => $hasBreakdown ? 'summary_with_breakdown' : 'summary_card',
            'needs_clarification'    => false,
            'clarification_question' => null,
        ];
    }

    /**
     * Build the user-turn prompt for the planner Gemini call.
     *
     * @param  GatewayTask  $task
     * @param  string|null  $userTemplate
     * @return string
     */
    private function buildUserPrompt(
        GatewayTask $task,
        string $question,
        string $toolsContext,
        string $periods,
        ?string $userTemplate,
    ): string
    {
        $context = json_encode([
            'intent'      => $task->intent,
            'scope'       => $task->scope,
            'subject'     => $task->subject,
            'entities'    => $task->entities,
            'filters'     => $task->filters,
            'period'      => $task->period,
            'compare_with' => $task->compareWith,
        ], JSON_UNESCAPED_UNICODE);

        if ($userTemplate) {
            return str_replace(
                [
                    '{{task_context}}',
                    '{{tools_catalog}}',
                    '{{valid_periods}}',
                    '{{user_message}}',
                    '{{scope}}',
                    '{{subject}}',
                    '{{intent}}',
                    '{{filters}}',
                ],
                [
                    (string) $context,
                    $toolsContext,
                    $periods,
                    $question,
                    $task->scope,
                    $task->subject,
                    $task->intent,
                    json_encode($task->filters, JSON_UNESCAPED_UNICODE) ?: '{}',
                ],
                $userTemplate
            );
        }

        return "Task context:\n{$context}\n\nSelect the most relevant tools and parameters from the catalog. Respond with JSON only.";
    }

    /**
     * Strip markdown code fences Gemini occasionally wraps around JSON.
     *
     * @param  string  $raw
     * @return string
     */
    private function stripCodeFences(string $raw): string
    {
        $clean = (string) preg_replace('/^```(?:json)?\s*/m', '', $raw);

        return (string) preg_replace('/```\s*$/m', '', $clean);
    }

    /**
     * Fallback system prompt injecting the tool catalog when DB template is missing.
     *
     * @param  string  $toolsContext
     * @param  string  $periods
     * @return string
     */
    private function defaultSystemPrompt(string $toolsContext, string $periods): string
    {
        return <<<PROMPT
You are an Analytics Planner for Snapi Studio.
Given a task context (intent, scope, subject, filters, period), select the appropriate tools from the catalog.

Available tools:
{$toolsContext}

Valid periods: {$periods}

Respond with ONLY a valid JSON matching this schema:
{
  "tools": [
    {
      "tool_name": "get_post_overview",
      "params": {
        "period": "current_week",
        "compare_with": "previous_week",
        "filters": { "status": "scheduled" }
      }
    }
  ],
  "response_view": "summary_with_breakdown",
  "needs_clarification": false,
  "clarification_question": null
}

Rules:
- Only select tools that exist in the catalog above
- Only set needs_clarification=true if the intent is truly ambiguous
- Apply filters from the task context to each relevant tool
- Select 1-3 tools maximum; prefer specificity over breadth
PROMPT;
    }
}
