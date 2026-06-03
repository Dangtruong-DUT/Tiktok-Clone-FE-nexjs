<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;

class RewriteContentHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
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

        $variants = $data['variants'] ?? [['label' => 'Rewritten', 'value' => $result['text']]];
        $mainText = $variants[0]['value'] ?? $result['text'];

        $structuredOutput = [
            'type'         => 'content_card',
            'target_field' => $intent->targetFormField(),
            'variants'     => $variants,
            'hashtags'     => $data['hashtags'] ?? [],
            'confidence'   => (float) ($data['confidence'] ?? 0.8),
        ];

        return new CopilotHandlerResult(
            text:             $mainText,
            structuredOutput: $structuredOutput,
            followUpChips:    ['Try another style', 'Make it shorter', 'Generate hashtags', 'Analyze viral potential'],
            targetField:      $intent->targetFormField(),
            tokenUsage:       $result['token_usage'],
            latencyMs:        $latencyMs,
        );
    }
}
