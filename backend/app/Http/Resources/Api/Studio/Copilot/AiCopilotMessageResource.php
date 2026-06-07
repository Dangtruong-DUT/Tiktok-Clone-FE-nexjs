<?php

namespace App\Http\Resources\Api\Studio\Copilot;

use App\Http\Resources\BaseJsonResource;
use App\Models\AiCopilotMessage;
use Illuminate\Http\Request;

/** @mixin AiCopilotMessage */
class AiCopilotMessageResource extends BaseJsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid'              => $this->uuid,
            'role'              => $this->role->value,
            'content'           => $this->content,
            'intent'            => $this->intent,
            'task_type'         => $this->structured_output['task_type'] ?? null,
            'structured_output' => $this->structured_output,
            'follow_up_chips'   => $this->follow_up_chips ?? [],
            'status'            => $this->status,
            'latency_ms'        => $this->latency_ms,
            'created_at'        => $this->created_at?->toISOString(),
        ];
    }
}
