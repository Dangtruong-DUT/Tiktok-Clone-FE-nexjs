<?php

namespace App\Services\AI\Copilot\Engines;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Services\AI\Copilot\Engines\Contracts\CopilotEngineInterface;
use App\Services\AI\Copilot\Gateway\GatewayTask;
use App\Services\Analytics\AnalyticsAnswerBuilder;
use App\Services\Analytics\AnalyticsPlannerService;
use App\Services\Analytics\AnalyticsToolExecutor;
use App\Repositories\AiStudioSettingRepository;

/**
 * Handles analytics queries using a Planner → ToolExecutor → AnswerBuilder pipeline.
 * All tool selection is catalog-driven; this engine never hardcodes tool names.
 */
class AnalyticsEngine extends AbstractCopilotEngine implements CopilotEngineInterface
{
    /**
     * @param  \App\Contracts\AI\GeminiClientInterface  $gemini
     * @param  \App\Repositories\AiPromptTemplateRepository  $templateRepo
     * @param  AnalyticsPlannerService  $planner
     * @param  AnalyticsToolExecutor    $executor
     * @param  AnalyticsAnswerBuilder   $answerBuilder
     */
    public function __construct(
        \App\Contracts\AI\GeminiClientInterface      $gemini,
        \App\Repositories\AiPromptTemplateRepository $templateRepo,
        AiStudioSettingRepository                    $settingRepository,
        private readonly AnalyticsPlannerService     $planner,
        private readonly AnalyticsToolExecutor       $executor,
        private readonly AnalyticsAnswerBuilder      $answerBuilder,
    ) {
        parent::__construct($gemini, $templateRepo, $settingRepository);
    }

    /**
     * Run the analytics pipeline: Planner → ToolExecutor → AnswerBuilder.
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
        $isAdmin = $context->userRole === 'super_admin';
        $locale  = $context->creatorLanguage ?? 'vi';
        $userId  = $context->userId;

        // Step 1: Planner selects tools from catalog based on GatewayTask
        $plan = $this->planner->plan($task, $isAdmin, $input->content);

        if ($plan['needs_clarification'] ?? false) {
            $text = $plan['clarification_question']
                ?? (string) trans('copilot.messages.analytics_clarification', [], $locale);

            if ($emit !== null) {
                $emit($text, true);
            }

            return new CopilotHandlerResult(
                text:          $text,
                followUpChips: $this->chips('analytics_clarification', $locale),
            );
        }

        // Step 2: Execute the selected tools
        $toolResults = $this->executor->execute(
            toolPlan: $plan['tools'] ?? [],
            scope:    $task->scope,
            subject:  $task->subject,
            userId:   $userId,
            isAdmin:  $isAdmin,
        );

        if (empty($toolResults)) {
            $fallback = (string) trans('copilot.messages.analytics_empty', [], $locale);

            if ($emit !== null) {
                $emit($fallback, true);
            }

            return new CopilotHandlerResult(
                text:          $fallback,
                followUpChips: $this->chips('analytics_empty', $locale),
            );
        }

        // Step 3: AnswerBuilder synthesizes tool results into natural language
        $answer = $this->answerBuilder->build(
            question:     $input->content,
            toolResults:  $toolResults,
            responseView: $plan['response_view'] ?? 'summary',
            locale:       $locale,
        );

        if ($emit !== null) {
            $emit($answer['text'], true);
        }

        return new CopilotHandlerResult(
            text:             $answer['text'],
            structuredOutput: [
                'type'         => 'analytics_result',
                'response_view' => $answer['response_view'],
                'tool_results'  => $answer['tool_results'],
            ],
            followUpChips:    $answer['follow_up_chips'],
        );
    }

    private function chips(string $key, string $locale): array
    {
        $chips = trans("copilot.chips.{$key}", [], $locale);

        return is_array($chips) ? $chips : [];
    }
}
