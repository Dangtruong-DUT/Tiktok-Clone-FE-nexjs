<?php

namespace App\Http\Resources;

use App\Models\AiCopilotMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin AiCopilotMessage */
class AiCopilotMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid'             => $this->uuid,
            'role'             => $this->role instanceof \BackedEnum ? $this->role->value : $this->role,
            'content'          => $this->content,
            'intent'           => $this->intent instanceof \BackedEnum ? $this->intent->value : $this->intent,
            'structured_output' => $this->structured_output,
            'follow_up_chips'  => $this->follow_up_chips ?? [],
            'status'           => $this->status,
            'latency_ms'       => $this->latency_ms,
            'created_at'       => $this->created_at?->toISOString(),
        ];
    }
}
