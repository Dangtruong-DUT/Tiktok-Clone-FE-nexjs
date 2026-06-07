<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;

/**
 * Handles: write_caption, write_title, write_description, suggest_cta
 */
class WriteCaptionHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function handle(
        AiCopilotIntentEnum    $intent,
        AiCopilotMessageInput  $input,
        AiCopilotSessionContext $context,
        AiPromptTemplate       $template,
        array                  $conversationHistory,
    ): CopilotHandlerResult {
        $startedAt    = hrtime(true);
        $systemPrompt = $this->buildSystemPrompt($template, $context);
        $userTurn     = $this->buildUserTurn($input, $template);
        $contents     = $this->buildContents($conversationHistory, $userTurn);

        $result = $this->sendWithHistory(
            systemPrompt: $systemPrompt,
            contents:     $contents,
            config:       ['responseMimeType' => 'application/json'],
        );

        $latencyMs = (int) round((hrtime(true) - $startedAt) / 1_000_000);

        $data = json_decode(self::cleanJsonResponse($result['text']), true) ?? [];

        $variants  = $data['variants'] ?? [['label' => 'Suggested', 'value' => $result['text']]];
        $hashtags  = $data['hashtags'] ?? [];
        $mainText  = $variants[0]['value'] ?? $result['text'];

        $structuredOutput = [
            'type'         => 'content_card',
            'target_field' => $intent->targetFormField(),
            'variants'     => $variants,
            'hashtags'     => $hashtags,
            'confidence'   => (float) ($data['confidence'] ?? 0.8),
        ];

        return new CopilotHandlerResult(
            text:             $mainText,
            structuredOutput: $structuredOutput,
            followUpChips:    $this->defaultFollowUpChips($intent->value),
            targetField:      $intent->targetFormField(),
            tokenUsage:       $result['token_usage'],
            latencyMs:        $latencyMs,
        );
    }
}
