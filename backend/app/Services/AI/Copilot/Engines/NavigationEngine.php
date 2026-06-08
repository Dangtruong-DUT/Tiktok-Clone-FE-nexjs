<?php

namespace App\Services\AI\Copilot\Engines;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\AppRouteInfo;
use App\DTOs\AI\CopilotHandlerResult;
use App\Services\AI\Copilot\Engines\Contracts\CopilotEngineInterface;
use App\Services\AI\Copilot\Gateway\GatewayTask;
use Illuminate\Support\Facades\Log;

/**
 * Handles navigation requests: maps the user's query to one or more app routes.
 * Route matching is deterministic; Gemini only polishes the response text.
 */
class NavigationEngine extends AbstractCopilotEngine implements CopilotEngineInterface
{
    private const ANSWER_TEMPLATE_INTENT = 'navigation_answer_builder';

    /**
     * Handle a navigation task and return a nav_card structured output.
     *
     * @param  GatewayTask             $task
     * @param  AiCopilotMessageInput   $input
     * @param  AiCopilotSessionContext  $context
     * @param  array<array{role: string, parts: array}>  $conversationHistory
     * @param  callable(string $chunk, bool $done): void|null  $emit
     * @return CopilotHandlerResult
     */
    public function handle(
        GatewayTask            $task,
        AiCopilotMessageInput  $input,
        AiCopilotSessionContext $context,
        array                  $conversationHistory,
        ?callable              $emit = null,
    ): CopilotHandlerResult {
        $locale  = $context->creatorLanguage ?? 'vi';
        $msg     = mb_strtolower($input->content);
        $matched = $this->matchRoutes($msg, $locale);

        if (empty($matched)) {
            $matched = array_map(
                fn (array $r) => $this->routeInfo($r, $context->creatorLanguage ?? 'vi'),
                $this->routeMap(),
            );
            $fallbackIntro = (string) trans('copilot.messages.navigation_all', [], $locale);
            $matchMode = 'all_routes';
        } else {
            $fallbackIntro = (string) trans('copilot.messages.navigation_matched', [], $locale);
            $matchMode = 'matched_routes';
        }

        $intro = $this->buildNavigationAnswer(
            question:      $input->content,
            routes:        $matched,
            locale:        $locale,
            userRole:      $context->userRole ?? 'creator',
            matchMode:     $matchMode,
            fallbackIntro: $fallbackIntro,
        );

        $structuredOutput = [
            'type'   => 'nav_card',
            'routes' => array_map(fn (AppRouteInfo $r) => $r->toArray(), $matched),
        ];

        if ($emit !== null) {
            $emit($intro, true);
        }

        return new CopilotHandlerResult(
            text:             $intro,
            structuredOutput: $structuredOutput,
            followUpChips:    $this->chips($locale),
        );
    }

    /**
     * Match ROUTE_MAP entries by keyword.
     *
     * @param  string  $message
     * @return list<AppRouteInfo>
     */
    private function matchRoutes(string $message, string $locale): array
    {
        $matched = [];

        foreach ($this->routeMap() as $entry) {
            foreach ($entry['keywords'] as $kw) {
                if (str_contains($message, mb_strtolower($kw))) {
                    $matched[] = $this->routeInfo($entry, $locale);
                    break;
                }
            }
        }

        return $matched;
    }

    private function routeMap(): array
    {
        return (array) config('copilot.navigation_routes', []);
    }

    private function routeInfo(array $entry, string $locale): AppRouteInfo
    {
        $key = (string) ($entry['key'] ?? '');

        return new AppRouteInfo(
            (string) trans("copilot.routes.{$key}.label", [], $locale),
            (string) $entry['path'],
            (string) trans("copilot.routes.{$key}.description", [], $locale),
        );
    }

    private function chips(string $locale): array
    {
        $chips = trans('copilot.chips.navigation', [], $locale);

        return is_array($chips) ? $chips : [];
    }

    /**
     * Let Gemini write a natural navigation answer while keeping routes deterministic.
     *
     * @param  list<AppRouteInfo>  $routes
     */
    private function buildNavigationAnswer(
        string $question,
        array $routes,
        string $locale,
        string $userRole,
        string $matchMode,
        string $fallbackIntro,
    ): string {
        $routesJson = json_encode(
            array_map(fn (AppRouteInfo $route) => $route->toArray(), $routes),
            JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT,
        );

        $template = $this->templateRepo->findByIntent(self::ANSWER_TEMPLATE_INTENT);
        $systemPrompt = $template
            ? $this->buildSystemPrompt($template, new AiCopilotSessionContext(
                creatorLanguage: $locale,
                userRole:        $userRole,
            ))
            : $this->defaultSystemPrompt($locale);

        $userPrompt = $this->buildAnswerUserPrompt(
            question:     $question,
            routesJson:   (string) $routesJson,
            locale:       $locale,
            userRole:     $userRole,
            matchMode:    $matchMode,
            userTemplate: $template?->user_template,
        );

        try {
            $result = $this->gemini->send($this->buildRequest(
                systemPrompt: $systemPrompt,
                contents:     [['role' => 'user', 'parts' => [['text' => $userPrompt]]]],
                overrides:    [
                    'temperature'     => 0.25,
                    'maxOutputTokens' => 220,
                ],
            ))->toArray();

            $text = trim((string) ($result['text'] ?? ''));

            return $text !== '' ? $text : $fallbackIntro;
        } catch (\Throwable $e) {
            Log::channel(config('ai.logging.channel', 'stack'))->warning('Navigation answer builder failed', [
                'error' => $e->getMessage(),
            ]);

            return $fallbackIntro;
        }
    }

    private function buildAnswerUserPrompt(
        string $question,
        string $routesJson,
        string $locale,
        string $userRole,
        string $matchMode,
        ?string $userTemplate,
    ): string {
        if ($userTemplate) {
            return str_replace(
                [
                    '{{user_message}}',
                    '{{routes}}',
                    '{{route_candidates}}',
                    '{{locale}}',
                    '{{user_role}}',
                    '{{match_mode}}',
                ],
                [
                    $question,
                    $routesJson,
                    $routesJson,
                    $locale,
                    $userRole,
                    $matchMode,
                ],
                $userTemplate,
            );
        }

        return <<<PROMPT
User message: "{$question}"
Locale: {$locale}
User role: {$userRole}
Match mode: {$matchMode}

Route candidates:
{$routesJson}

Write a concise, helpful navigation answer. Mention that the user can open the relevant page below.
PROMPT;
    }

    private function defaultSystemPrompt(string $locale): string
    {
        if (str_starts_with($locale, 'vi')) {
            return 'Bạn là AI Copilot của Snapi Studio. Hãy trả lời yêu cầu điều hướng thật tự nhiên, ngắn gọn, thân thiện. '
                . 'Chỉ dùng các route được cung cấp, không bịa trang mới. Không in JSON hoặc URL thô nếu không cần.';
        }

        return 'You are the Snapi Studio AI Copilot. Answer navigation requests naturally, concisely, and helpfully. '
            . 'Use only the provided routes, never invent pages. Do not print raw JSON or raw URLs unless necessary.';
    }
}
