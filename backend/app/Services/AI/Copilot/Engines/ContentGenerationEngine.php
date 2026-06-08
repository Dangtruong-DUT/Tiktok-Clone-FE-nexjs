<?php

namespace App\Services\AI\Copilot\Engines;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Services\AI\Copilot\Engines\Contracts\CopilotEngineInterface;
use App\Services\AI\Copilot\Gateway\GatewayTask;

/**
 * Handles content generation tasks: caption, hashtag, title, description, rewrite, CTA.
 * Delegates to the existing Gemini streaming pipeline with intent-based templates.
 * Generative intents buffer JSON; analysis intents stream plain text.
 */
class ContentGenerationEngine extends AbstractCopilotEngine implements CopilotEngineInterface
{
    /**
     * Map from GatewayTask intent string to a Gemini prompt template intent.
     */
    private const INTENT_MAP = [
        'write_caption'      => 'write_caption',
        'write_title'        => 'write_title',
        'write_description'  => 'write_description',
        'generate_hashtags'  => 'generate_hashtags',
        'rewrite_content'    => 'rewrite_content',
        'suggest_cta'        => 'suggest_cta',
        'schedule_post'      => 'schedule_post',
        // Analysis intents routed here when task_type=content_generation
        'analyze_viral'      => 'analyze_viral',
        'analyze_retention'  => 'analyze_retention',
        'analyze_hook'       => 'analyze_hook',
        'analyze_cta'        => 'analyze_cta',
        'analyze_audience'   => 'analyze_audience',
        'general_advice'     => 'general_advice',
    ];

    /**
     * Intents that return structured JSON (content_card) — must be buffered.
     */
    private const GENERATIVE_INTENTS = [
        'write_caption', 'write_title', 'write_description',
        'generate_hashtags', 'rewrite_content', 'suggest_cta',
    ];

    /**
     * Handle the content generation task, streaming if $emit is provided.
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
        $intentKey    = self::INTENT_MAP[$task->intent] ?? 'general_advice';
        $templateIntent = $this->templateRepo->findByIntent($intentKey);
        $template     = $templateIntent ?? $this->templateRepo->findByIntent('general_advice');

        $systemPrompt = $this->buildSystemPrompt(
            $template ?? $this->makeFallbackTemplate(),
            $context
        );
        $userTurn     = $this->buildUserTurn(
            $input,
            $template ?? $this->makeFallbackTemplate()
        );
        $contents     = array_merge($conversationHistory, [$userTurn]);

        $isGenerative = in_array($intentKey, self::GENERATIVE_INTENTS, true);
        $accumulated  = '';
        $finalResult  = null;

        $this->gemini->stream(
            $this->buildRequest($systemPrompt, $contents),
            function (string $delta, bool $done, array $usage) use (
                &$accumulated, &$finalResult, $emit, $intentKey, $isGenerative, $context
            ) {
                if (! $done) {
                    $accumulated .= $delta;
                    if (! $isGenerative && $emit !== null) {
                        $emit($delta, false);
                    }

                    return;
                }

                $structuredOutput = null;
                $displayContent   = $accumulated;

                if ($isGenerative) {
                    [$displayContent, $structuredOutput] = $this->parseGenerativeResponse(
                        $accumulated,
                        $intentKey,
                        $context->creatorLanguage ?? app()->getLocale(),
                    );
                    if ($emit !== null) {
                        $emit($displayContent, true);
                    }
                } elseif ($emit !== null) {
                    $emit('', true);
                }

                $finalResult = new CopilotHandlerResult(
                    text:             $displayContent,
                    structuredOutput: $structuredOutput,
                    followUpChips:    $this->followUpChips($intentKey, $context->creatorLanguage ?? 'vi'),
                    tokenUsage:       $usage,
                );
            },
        );

        return $finalResult ?? new CopilotHandlerResult(text: '');
    }

    /**
     * Parse a generative (JSON) response into display text + structured_output.
     *
     * @param  string  $raw
     * @param  string  $intentKey
     * @return array{0: string, 1: array<string,mixed>|null}
     */
    private function parseGenerativeResponse(string $raw, string $intentKey, string $locale): array
    {
        $clean = $this->cleanJsonResponse($raw);
        $data  = json_decode($clean, true) ?? [];

        $targetField = match ($intentKey) {
            'generate_hashtags' => 'hashtags',
            'write_title'       => 'title',
            'write_description' => 'description',
            default             => 'content',
        };

        if (! empty($data['variants'])) {
            return [
                $data['variants'][0]['value'] ?? $raw,
                [
                    'type'         => 'content_card',
                    'target_field' => $targetField,
                    'variants'     => $data['variants'],
                    'hashtags'     => $data['hashtags'] ?? [],
                    'confidence'   => (float) ($data['confidence'] ?? 0.85),
                ],
            ];
        }

        if (! empty($data['hashtags'])) {
            return [
                implode(' ', $data['hashtags']),
                [
                    'type'         => 'content_card',
                    'target_field' => 'hashtags',
                    'variants'     => [['label' => 'Hashtags', 'value' => implode(' ', $data['hashtags'])]],
                    'hashtags'     => $data['hashtags'],
                    'confidence'   => (float) ($data['confidence'] ?? 0.85),
                ],
            ];
        }

        $text = $data['caption'] ?? $data['text'] ?? $data['content'] ?? $raw;

        return [
            $text,
            [
                'type'         => 'content_card',
                'target_field' => $targetField,
                'variants'     => [['label' => (string) trans('copilot.labels.suggestion', [], $locale), 'value' => $text]],
                'hashtags'     => $data['hashtags'] ?? [],
                'confidence'   => (float) ($data['confidence'] ?? 0.85),
            ],
        ];
    }

    /**
     * Return follow-up chip suggestions for an intent.
     *
     * @param  string  $intentKey
     * @return list<string>
     */
    private function followUpChips(string $intentKey, string $locale): array
    {
        $chips = trans("copilot.chips.{$intentKey}", [], $locale);

        return is_array($chips) ? $chips : (array) trans('copilot.chips.default', [], $locale);
    }

    /**
     * Minimal fallback AiPromptTemplate when DB has no matching template.
     *
     * @return \App\Models\AiPromptTemplate
     */
    private function makeFallbackTemplate(): \App\Models\AiPromptTemplate
    {
        $t                = new \App\Models\AiPromptTemplate();
        $t->system_prompt = 'You are Snapi Studio AI — a creative content assistant. Help with captions, hashtags, titles, and video analysis. Respond in the user\'s language.';
        $t->user_template = '{{user_message}}';

        return $t;
    }
}
