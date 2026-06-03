<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;

class GenerateHashtagsHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
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

        $result = $this->gemini->generateWithHistory(
            systemPrompt: $systemPrompt,
            contents:     $contents,
            config:       ['responseMimeType' => 'application/json'],
        );

        $latencyMs = (int) round((hrtime(true) - $startedAt) / 1_000_000);

        $clean = (string) preg_replace('/^```(?:json)?\s*/m', '', $result['text']);
        $clean = (string) preg_replace('/```\s*$/m', '', $clean);
        $data  = json_decode(trim($clean), true) ?? [];

        $hashtags = $data['hashtags'] ?? [];
        $listText = implode(' ', $hashtags) ?: $result['text'];

        $structuredOutput = [
            'type'         => 'content_card',
            'target_field' => 'hashtags',
            'variants'     => [['label' => 'Hashtags', 'value' => implode(' ', $hashtags)]],
            'hashtags'     => $hashtags,
            'confidence'   => (float) ($data['confidence'] ?? 0.85),
        ];

        return new CopilotHandlerResult(
            text:             $listText,
            structuredOutput: $structuredOutput,
            followUpChips:    $this->defaultFollowUpChips($intent->value),
            targetField:      'hashtags',
            tokenUsage:       $result['token_usage'],
            latencyMs:        $latencyMs,
        );
    }
}
