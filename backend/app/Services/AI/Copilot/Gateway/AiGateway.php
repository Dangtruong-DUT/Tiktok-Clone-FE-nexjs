<?php

namespace App\Services\AI\Copilot\Gateway;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\Gemini\GeminiConfig;
use App\DTOs\AI\Gemini\GeminiRequest;
use App\Models\AiDocument;
use App\Repositories\AiStudioSettingRepository;
use App\Repositories\AiPromptTemplateRepository;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * AI Gateway: classifies user intent into a high-level GatewayTask.
 * Uses Gemini structured output (responseMimeType=application/json).
 * Does NOT select analytics tools — that is the Planner's responsibility.
 */
class AiGateway
{
    private const GATEWAY_INTENT = 'gateway_planner';

    /**
     * @param  GeminiClientInterface      $gemini
     * @param  AiPromptTemplateRepository $templateRepo
     */
    public function __construct(
        private readonly GeminiClientInterface      $gemini,
        private readonly AiPromptTemplateRepository $templateRepo,
        private readonly AiStudioSettingRepository  $settingRepository,
    ) {}

    /**
     * Classify the user's question and return a routing task.
     * Falls back to GatewayTask::unknown() on any error.
     *
     * @param  string  $question
     * @param  string  $locale
     * @param  bool    $isAdmin
     * @param  array<array{role: string, parts: array}>  $conversationHistory
     * @return GatewayTask
     */
    public function understand(
        string $question,
        string $locale,
        bool   $isAdmin,
        ?string $surface = null,
        array  $conversationHistory = [],
    ): GatewayTask {
        $template = $this->templateRepo->findByIntent(self::GATEWAY_INTENT);

        $systemPrompt = $template?->system_prompt ?? $this->defaultSystemPrompt();
        $systemPrompt = $this->injectKnowledgeCatalog($systemPrompt);
        $systemPrompt = $this->injectAnalyticsCatalog($systemPrompt, $isAdmin);
        $systemPrompt = $this->prependRolePolicy($systemPrompt, $isAdmin, $locale, $surface);
        $userPrompt   = $this->buildUserPrompt($question, $locale, $isAdmin, $template?->user_template);
        $recentHistory = array_slice($conversationHistory, -3);
        $contents      = array_merge(
            $recentHistory,
            [['role' => 'user', 'parts' => [['text' => $userPrompt]]]]
        );

        try {
            $result = $this->gemini->send(new GeminiRequest(
                systemPrompt: $systemPrompt,
                contents:     $contents,
                config:       GeminiConfig::fromSetting($this->settingRepository->current(), [
                    'temperature'      => 0.1,
                    'maxOutputTokens'  => 5000,
                    'responseMimeType' => 'application/json',
                ]),
            ))->toArray();

            Log::alert('Raw gateway response', ['response' => $result, 'session_id' => null, 'message_id' => null]);

            $clean   = $this->stripCodeFences((string) ($result['text'] ?? ''));
            $payload = json_decode(trim($clean), true);

            if (json_last_error() !== JSON_ERROR_NONE || ! is_array($payload)) {
                return GatewayTask::unknown();
            }

            $task = GatewayTask::fromArray($payload);

            if ($surface !== 'studio_editor' && in_array($task->taskType, ['content_generation', 'video_review'], true)) {
                return GatewayTask::unknown();
            }

            return $task;
        } catch (\Throwable $e) {
            Log::channel(config('ai.logging.channel', 'stack'))->warning('AI Gateway parse failed, falling back to unknown', [
                'error' => $e->getMessage(),

            ]);

            return GatewayTask::unknown();
        }
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
     * Build the user-turn prompt for the gateway call.
     *
     * @param  string       $question
     * @param  string       $locale
     * @param  bool         $isAdmin
     * @param  string|null  $userTemplate
     * @return string
     */
    private function buildUserPrompt(string $question, string $locale, bool $isAdmin, ?string $userTemplate): string
    {
        $roleHint   = $isAdmin ? 'super_admin' : 'creator';
        $localeHint = "locale: {$locale}";

        if ($userTemplate && str_contains($userTemplate, '{{user_message}}')) {
            return str_replace(
                ['{{user_message}}', '{{user_role}}', '{{locale}}'],
                [$question, $roleHint, $locale],
                $userTemplate
            );
        }

        return "User message: \"{$question}\"\nuser_role: {$roleHint}\n{$localeHint}\n\nRespond with JSON only.";
    }

    private function prependRolePolicy(string $systemPrompt, bool $isAdmin, string $locale, ?string $surface): string
    {
        $language = $locale === 'en' ? 'English' : 'Vietnamese';
        $languageRule = "The field `clarification_question` must be written in {$language}. "
            . 'All other fields (task_type, scope, subject, intent, entities, filters, period, compare_with) '
            . 'must always be in English regardless of the user\'s language.';

        $surfaceRule = $surface === 'studio_editor'
            ? 'Surface=studio_editor. Content generation and video review are allowed only here.'
            : 'Surface is not the editor. Do not route to content_generation or video_review.';

        $roleRule = $isAdmin
            ? 'The user is a super admin. Prefer analytics, app_knowledge, navigation, or unknown.'
            : 'The user is a creator.';

        return "## Routing Policy\n{$languageRule}\n{$roleRule}\n{$surfaceRule}\n\n{$systemPrompt}";
    }

    /**
     * Append a live knowledge catalog (title + first-chunk excerpt) to the system prompt.
     * Cached for 5 minutes. If the knowledge base is empty, returns the prompt unchanged.
     *
     * Titles alone are insufficient — Gemini needs a short content excerpt to judge
     * whether a user question is actually covered by a given document.
     */
    private function injectKnowledgeCatalog(string $systemPrompt): string
    {
        $catalog = Cache::remember('rag_knowledge_catalog', 300, function () {
            return AiDocument::indexed()
                ->orderBy('title')
                ->get(['title', 'description'])
                ->map(fn (AiDocument $doc) => [
                    'title'       => $doc->title,
                    'description' => $doc->description ?? '',
                ])
                ->all();
        });

        if (empty($catalog)) {
            return $systemPrompt;
        }

        $list = implode("\n", array_map(function (array $doc) {
            $line = "- {$doc['title']}";
            if ($doc['description'] !== '') {
                $line .= ": {$doc['description']}";
            }

            return $line;
        }, $catalog));

        return $systemPrompt
            . "\n\n## Available Knowledge Base Documents\n"
            . "Use task_type=app_knowledge ONLY when the user's question clearly relates to one of the documents below.\n"
            . "If the topic is NOT covered by these documents, do NOT use task_type=app_knowledge — use task_type=unknown instead.\n\n"
            . $list;
    }

    /**
     * Append the full analytics tool catalog to the system prompt.
     * Gemini needs filters/subjects/params — not just names — to correctly
     * extract scope, subject, period, and filters into the GatewayTask.
     * Cached per scope for 5 minutes (same TTL as the RAG catalog).
     */
    private function injectAnalyticsCatalog(string $systemPrompt, bool $isAdmin): string
    {
        $scope = $isAdmin ? 'admin' : 'creator';

        $lines = Cache::remember("analytics_intent_catalog:{$scope}", 300, function () use ($scope) {
            $result = [];
            foreach (config('analytics.tools', []) as $name => $def) {
                if (! in_array($scope, (array) ($def['scopes'] ?? []), true)) {
                    continue;
                }

                $description   = $def['description'] ?? '';
                $scopes        = implode(', ', $def['scopes'] ?? []);
                $subjects      = implode(', ', $def['subjects'] ?? []);
                $required      = implode(', ', $def['required_params'] ?? []);
                $optional      = implode(', ', $def['optional_params'] ?? []);
                $filters       = implode(', ', $def['allowed_filters'] ?? []);
                $metrics       = implode(', ', $def['metrics'] ?? []);
                $defaultPeriod = $def['default_period'] ?? '';

                $line = "- {$name}: {$description}";
                $line .= " | scopes: {$scopes}";
                $line .= " | subjects: {$subjects}";
                if ($defaultPeriod) {
                    $line .= " | default_period: {$defaultPeriod}";
                }
                if ($required) {
                    $line .= " | required: {$required}";
                }
                if ($optional) {
                    $line .= " | optional: {$optional}";
                }
                if ($filters) {
                    $line .= " | allowed_filters: {$filters}";
                }
                if ($metrics) {
                    $line .= " | metrics: {$metrics}";
                }

                $result[] = $line;
            }
            return $result;
        });

        if (empty($lines)) {
            return $systemPrompt;
        }

        return $systemPrompt
            . "\n\n## Available Analytics Intents\n"
            . "When task_type=analytics, `intent` MUST be one of the tool names below (exact key). "
            . "Use `scopes`/`subjects` to set the correct scope and subject fields. "
            . "Extract `filters` only from `allowed_filters` for that tool — do not add other filter keys. "
            . "For `period`: if the user specifies one use it; otherwise use the tool's `default_period` and do NOT ask for clarification just because period is missing. "
            . "VAGUE QUERY RULE: When the user asks about their account/stats in general ('thống kê', 'tài khoản', 'xem số liệu', 'my stats', 'account statistics', 'số liệu của tôi') without specifying a metric, pick the closest general tool — do NOT ask for clarification. "
            . "Defaults: scope=creator → `get_post_overview`; scope=admin → `get_user_growth`. "
            . "NEVER return intent=null when task_type=analytics — always pick the best matching tool. "
            . "When task_type=analytics, needs_tools MUST be true even if needs_clarification=true. "
            . "Set needs_clarification=true only when the topic is entirely unclear (not just vague or missing a period). "
            . "If the question is about kháng cáo/appeals, prefer `get_appeal_overview` for status counts and `get_appeal_sla_metrics` for backlog/SLA questions. "
            . "If no tool whatsoever matches the user's question, set task_type=unknown instead.\n\n"
            . implode("\n", $lines);
    }

    /**
     * Fallback system prompt when no DB template is seeded yet.
     *
     * @return string
     */
    private function defaultSystemPrompt(): string
    {
        return <<<'PROMPT'
You are an AI Gateway for Snapi Studio — a short-form video creation and management platform.
Your ONLY job is to classify the user's message into a routing task.
You do NOT answer questions, generate content, or select analytics tools.

═══════════════════════════════════════════
LANGUAGE RULE — ABSOLUTE, NO EXCEPTIONS:
Only `clarification_question` may be written in the user's language (Vietnamese/English).
Every other field MUST be in English using exact canonical values. Never translate field values.
═══════════════════════════════════════════

FIELD CANONICAL VALUES:

`task_type`: content_generation | app_knowledge | navigation | analytics | video_review | unknown
`scope`: creator | admin | system | public
`subject`: self | platform | specific_user | specific_post | specific_video

`intent`:
  - analytics → exact tool name from "## Available Analytics Intents" below. NEVER invent.
  - others → short English snake_case label (write_caption, navigate_to_settings, analyze_hook)

Analytics routing guidance:
- Questions about appeal/kháng cáo status, pending appeals, approval/rejection counts, or moderation review should route to `get_appeal_overview`.
- Questions about appeal backlog, oldest pending appeal, or resolution time should route to `get_appeal_sla_metrics`.
- Do not ask for clarification just because the user omitted the period; use the tool's default period.

`entities` — English canonical nouns ONLY. NEVER translate from the user's language.
  Valid: users, posts, videos, comments, followers, hashtags, appeals, encodings, ai_usage, queue

`period` — exact string from valid list, or null. If user omits period, use tool's `default_period`. Do NOT ask for clarification just because period is missing.
  Valid: today, yesterday, last_7_days, current_week, previous_week, current_month, previous_month, last_30_days, current_quarter, last_90_days, current_year, previous_year

`filters` — keys from tool's allowed_filters only. English values only.
`needs_tools` — true when task_type=analytics (ALWAYS true for analytics, even when needs_clarification=true)
`needs_rag`   — true only when task_type=app_knowledge
`needs_clarification` — true only when the topic is completely unclear. For vague analytics queries ("my stats", "account stats"), pick a default tool instead of asking. NEVER set intent=null for analytics.

Respond with ONLY valid JSON:
{
  "task_type": "analytics",
  "scope": "admin",
  "subject": "platform",
  "intent": "get_user_growth",
  "entities": ["users"],
  "filters": {},
  "period": "last_7_days",
  "compare_with": null,
  "needs_tools": true,
  "needs_rag": false,
  "needs_clarification": false,
  "clarification_question": null,
  "confidence": 0.93
}
PROMPT;
    }
}
