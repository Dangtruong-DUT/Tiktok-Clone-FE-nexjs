<?php

namespace App\Services\AI\Copilot\Engines;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Services\AI\Copilot\Engines\Contracts\CopilotEngineInterface;
use App\Services\AI\Copilot\Gateway\GatewayTask;

/**
 * Handles video review tasks: hook, retention, viral potential, frame analysis, segment review.
 * Uses Gemini streaming with the appropriate analysis template.
 */
class VideoReviewEngine extends AbstractCopilotEngine implements CopilotEngineInterface
{
    /**
     * Map from GatewayTask intent to DB template intent.
     */
    private const INTENT_MAP = [
        'analyze_video'         => 'analyze_video',
        'analyze_viral'         => 'analyze_viral',
        'analyze_retention'     => 'analyze_retention',
        'analyze_hook'          => 'analyze_hook',
        'analyze_cta'           => 'analyze_cta',
        'analyze_audience'      => 'analyze_audience',
        'analyze_frame'         => 'analyze_frame',
        'analyze_video_segment' => 'analyze_video_segment',
    ];

    /**
     * Handle a video review task using Gemini streaming with template.
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
        $intentKey = self::INTENT_MAP[$task->intent] ?? 'analyze_video';
        $template  = $this->templateRepo->findByIntent($intentKey)
            ?? $this->templateRepo->findByIntent('analyze_video');

        $systemPrompt = $this->buildSystemPrompt(
            $template ?? $this->makeFallbackTemplate(),
            $context
        );
        $userTurn = $this->buildUserTurn(
            $input,
            $template ?? $this->makeFallbackTemplate()
        );
        $contents = array_merge($conversationHistory, [$userTurn]);

        $accumulated = '';
        $finalResult = null;

        $this->gemini->stream(
            $this->buildRequest($systemPrompt, $contents),
            function (string $delta, bool $done, array $usage) use (&$accumulated, &$finalResult, $emit, $intentKey, $context) {
                if (! $done) {
                    $accumulated .= $delta;
                    if ($emit !== null) {
                        $emit($delta, false);
                    }

                    return;
                }

                if ($emit !== null) {
                    $emit('', true);
                }

                $finalResult = new CopilotHandlerResult(
                    text:          $accumulated,
                    followUpChips: $this->followUpChips($intentKey, $context->creatorLanguage ?? 'vi'),
                    tokenUsage:    $usage,
                );
            },
        );

        return $finalResult ?? new CopilotHandlerResult(text: '');
    }

    /**
     * Return follow-up chip suggestions for a video review intent.
     *
     * @param  string  $intentKey
     * @return list<string>
     */
    private function followUpChips(string $intentKey, string $locale): array
    {
        $chips = trans("copilot.chips.{$intentKey}", [], $locale);

        return is_array($chips) ? $chips : (array) trans('copilot.chips.analyze_video', [], $locale);
    }

    /**
     * Minimal fallback template when no DB template is found.
     *
     * @return \App\Models\AiPromptTemplate
     */
    private function makeFallbackTemplate(): \App\Models\AiPromptTemplate
    {
        $t                = new \App\Models\AiPromptTemplate();
        $t->system_prompt = 'You are Snapi Studio AI — a video analysis expert. Analyze the video for hook, viral potential, retention, and audience fit. Be specific and actionable. Respond in the user\'s language.';
        $t->user_template = '{{user_message}}';

        return $t;
    }
}
