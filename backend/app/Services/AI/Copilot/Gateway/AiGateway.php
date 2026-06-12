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
        array  $conversationHistory = [],
    ): GatewayTask {
        $template = $this->templateRepo->findByIntent(self::GATEWAY_INTENT);

        $systemPrompt = $template?->system_prompt ?? $this->defaultSystemPrompt();
        $systemPrompt = $this->injectKnowledgeCatalog($systemPrompt);
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
                    'maxOutputTokens'  => 300,
                    'responseMimeType' => 'application/json',
                ]),
            ))->toArray();

            Log::alert('Raw gateway response', ['response' => $result, 'session_id' => null, 'message_id' => null]);

            $clean   = $this->stripCodeFences((string) ($result['text'] ?? ''));
            $payload = json_decode(trim($clean), true);

            if (json_last_error() !== JSON_ERROR_NONE || ! is_array($payload)) {
                return GatewayTask::unknown();
            }

            return GatewayTask::fromArray($payload);
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
     * Fallback system prompt when no DB template is seeded yet.
     *
     * @return string
     */
    private function defaultSystemPrompt(): string
    {
        return <<<'PROMPT'
You are an AI Gateway for Snapi Studio — a short-form video platform.
Classify the user's message into a routing task.

Valid task_types: content_generation, app_knowledge, navigation, analytics, video_review, unknown

Valid scopes: creator, admin, system, public
Valid subjects: self, platform, specific_user, specific_post, specific_video

Respond with ONLY a valid JSON object matching this schema:
{
  "task_type": "analytics",
  "scope": "admin",
  "subject": "platform",
  "intent": "post_moderation_stats",
  "entities": ["posts"],
  "filters": { "status": "hidden", "reason": "toxic" },
  "period": "current_week",
  "compare_with": null,
  "needs_tools": true,
  "needs_rag": false,
  "needs_clarification": false,
  "clarification_question": null,
  "confidence": 0.91
}

Rules:
- task_type=content_generation: user wants to write/generate/rewrite content (caption, hashtag, title, description)
- task_type=app_knowledge: user asks how Snapi features work, what something is
- task_type=navigation: user wants to navigate to a page/section
- task_type=analytics: user asks for statistics, metrics, trends, performance data
- task_type=video_review: user wants video analysis (hook, retention, viral potential, frame review)
- task_type=unknown: unclear intent → set needs_clarification=true, provide clarification_question

Scope rules:
- scope=creator when user asks about their own data ("của tôi", "my posts")
- scope=admin when user_role=super_admin and asks about platform/system data
- scope=system when asking about technical health (encoding, queue, API errors)

NEVER fallback to task_type=content_generation when uncertain — use task_type=unknown instead.
NEVER select analytics tools — only classify the task type and extract filter conditions.
PROMPT;
    }
}
