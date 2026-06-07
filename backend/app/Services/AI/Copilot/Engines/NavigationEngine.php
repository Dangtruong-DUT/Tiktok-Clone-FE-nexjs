<?php

namespace App\Services\AI\Copilot\Engines;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\AppRouteInfo;
use App\DTOs\AI\CopilotHandlerResult;
use App\Services\AI\Copilot\Engines\Contracts\CopilotEngineInterface;
use App\Services\AI\Copilot\Gateway\GatewayTask;

/**
 * Handles navigation requests: maps the user's query to one or more app routes.
 * Zero Gemini calls — pure keyword-to-route resolution.
 */
class NavigationEngine extends AbstractCopilotEngine implements CopilotEngineInterface
{
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
            $intro = (string) trans('copilot.messages.navigation_all', [], $locale);
        } else {
            $intro = (string) trans('copilot.messages.navigation_matched', [], $locale);
        }

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
}
