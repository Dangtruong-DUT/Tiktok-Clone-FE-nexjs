<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;

interface CopilotHandlerInterface
{
    /**
     * Handle an AI copilot intent and return the result.
     *
     * @param  array<array{role: string, parts: array}>  $conversationHistory  Gemini-formatted history
     */
    public function handle(
        AiCopilotIntentEnum    $intent,
        AiCopilotMessageInput  $input,
        AiCopilotSessionContext $context,
        AiPromptTemplate       $template,
        array                  $conversationHistory,
    ): CopilotHandlerResult;
}
