<?php

namespace App\Services\AI\Copilot\Orchestrator;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Services\AI\Copilot\Engines\AnalyticsEngine;
use App\Services\AI\Copilot\Engines\AppKnowledgeEngine;
use App\Services\AI\Copilot\Engines\ContentGenerationEngine;
use App\Services\AI\Copilot\Engines\NavigationEngine;
use App\Services\AI\Copilot\Engines\VideoReviewEngine;
use App\Services\AI\Copilot\Gateway\GatewayTask;

/**
 * Routes a GatewayTask to the appropriate engine.
 * Each engine handles one task_type family independently.
 */
class CopilotOrchestrator
{
    /**
     * @param  ContentGenerationEngine  $contentGeneration
     * @param  AppKnowledgeEngine       $appKnowledge
     * @param  NavigationEngine         $navigation
     * @param  AnalyticsEngine          $analytics
     * @param  VideoReviewEngine        $videoReview
     */
    public function __construct(
        private readonly ContentGenerationEngine $contentGeneration,
        private readonly AppKnowledgeEngine      $appKnowledge,
        private readonly NavigationEngine        $navigation,
        private readonly AnalyticsEngine         $analytics,
        private readonly VideoReviewEngine       $videoReview,
    ) {}

    /**
     * Dispatch the task to the matching engine and return the result.
     *
     * @param  GatewayTask             $task
     * @param  AiCopilotMessageInput   $input
     * @param  AiCopilotSessionContext  $context
     * @param  array<array{role: string, parts: array}>  $conversationHistory
     * @param  callable(string $chunk, bool $done): void|null  $emit
     * @return CopilotHandlerResult
     */
    public function dispatch(
        GatewayTask            $task,
        AiCopilotMessageInput  $input,
        AiCopilotSessionContext $context,
        array                  $conversationHistory,
        ?callable              $emit = null,
    ): CopilotHandlerResult {
        $engine = match ($task->taskType) {
            'content_generation' => $this->contentGeneration,
            'app_knowledge'      => $this->appKnowledge,
            'navigation'         => $this->navigation,
            'analytics'          => $this->analytics,
            'video_review'       => $this->videoReview,
            default              => null,
        };

        if ($engine === null) {
            return $this->clarificationResult($task, $context->creatorLanguage ?? 'vi');
        }

        return $engine->handle($task, $input, $context, $conversationHistory, $emit);
    }

    /**
     * Build a clarification result when task_type=unknown or no engine matched.
     *
     * @param  GatewayTask  $task
     * @return CopilotHandlerResult
     */
    private function clarificationResult(GatewayTask $task, string $locale): CopilotHandlerResult
    {
        $text = $task->clarificationQuestion
            ?? (string) trans('copilot.messages.clarification', [], $locale);

        return new CopilotHandlerResult(
            text:          $text,
            followUpChips: $this->chips('clarification', $locale),
        );
    }

    private function chips(string $key, string $locale = 'vi'): array
    {
        $chips = trans("copilot.chips.{$key}", [], $locale);

        return is_array($chips) ? $chips : [];
    }
}
