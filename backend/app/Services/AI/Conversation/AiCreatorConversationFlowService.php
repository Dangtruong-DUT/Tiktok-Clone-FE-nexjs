<?php

namespace App\Services\AI\Conversation;

use App\Enums\Ai\AiConversationStepEnum;

/**
 * Pure step-machine for the AI Creator Chat conversation flow.
 * Never calls Gemini — only determines state transitions and question text.
 */
class AiCreatorConversationFlowService
{
    /**
     * Returns the question + options for a given step.
     *
     * @return array{step: string, question: string, options: array<string>|null, is_optional: bool}
     */
    public function getStepPrompt(AiConversationStepEnum $step): array
    {
        return [
            'step'        => $step->value,
            'question'    => $step->question(),
            'options'     => $step->options(),
            'is_optional' => $step->isOptional(),
        ];
    }

    /**
     * Returns the next step after the current one, or null if all steps are complete.
     */
    public function nextStep(AiConversationStepEnum $current): ?AiConversationStepEnum
    {
        return $current->next();
    }

    /**
     * Returns true when all required steps have been answered.
     * Optional steps (hook) may be skipped.
     */
    public function isReadyToGenerate(array $answers): bool
    {
        $required = array_filter(
            AiConversationStepEnum::sequence(),
            fn ($step) => ! $step->isOptional()
        );

        foreach ($required as $step) {
            if (empty($answers[$step->value])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns the first unanswered step, or null if all done.
     */
    public function firstUnansweredStep(array $answers): ?AiConversationStepEnum
    {
        foreach (AiConversationStepEnum::sequence() as $step) {
            if ($step->isOptional()) {
                continue;
            }
            if (empty($answers[$step->value])) {
                return $step;
            }
        }

        return null;
    }
}
