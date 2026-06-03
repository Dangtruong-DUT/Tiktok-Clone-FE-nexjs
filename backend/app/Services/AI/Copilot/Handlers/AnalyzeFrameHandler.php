<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;

class AnalyzeFrameHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
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
        );

        $latencyMs = (int) round((hrtime(true) - $startedAt) / 1_000_000);

        return new CopilotHandlerResult(
            text:             $result['text'],
            structuredOutput: null,
            followUpChips:    $this->defaultFollowUpChips($intent->value),
            targetField:      null,
            tokenUsage:       $result['token_usage'],
            latencyMs:        $latencyMs,
        );
    }
}
