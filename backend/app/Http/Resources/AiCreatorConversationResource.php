<?php

namespace App\Http\Resources;

use App\Enums\Ai\AiConversationStatusEnum;
use Illuminate\Http\Request;

class AiCreatorConversationResource extends BaseJsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'uuid'             => $this->uuid,
            'status'           => $this->status instanceof AiConversationStatusEnum
                ? $this->status->value
                : $this->status,
            'status_label'     => $this->status instanceof AiConversationStatusEnum
                ? $this->status->translate()
                : $this->status,
            'current_step'         => $this->current_step?->value ?? $this->current_step,
            'initial_prompt'       => $this->initial_prompt,
            'answers'              => $this->answers ?? [],
            'last_ai_message'      => $this->last_ai_message,
            'options'              => $this->options,
            // Domain-level flag — never rely on last_ai_message text for readiness detection
            'is_ready_to_generate' => $this->status === AiConversationStatusEnum::WAITING_FOR_ANSWER
                && empty($this->options)
                && isset(($this->answers ?? [])['topic'])
                && isset(($this->answers ?? [])['format'])
                && isset(($this->answers ?? [])['audience'])
                && isset(($this->answers ?? [])['tone']),
            'generated_result' => $this->generated_result,
            'token_usage'      => $this->when(
                $this->status === AiConversationStatusEnum::COMPLETED,
                $this->token_usage
            ),
            'error_message'    => $this->when(
                $this->status === AiConversationStatusEnum::FAILED,
                $this->error_message
            ),
            'completed_at'     => $this->completed_at?->toIso8601String(),
            'created_at'       => $this->created_at->toIso8601String(),
        ];
    }
}
