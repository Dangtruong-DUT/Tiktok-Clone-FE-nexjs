<?php

namespace App\Http\Resources;

use App\Models\AiCopilotSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin AiCopilotSession */
class AiCopilotSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid'             => $this->uuid,
            'context_snapshot' => $this->context_snapshot,
            'is_large_video'   => $this->isLargeVideo(),
            'expires_at'       => $this->expires_at?->toISOString(),
            'created_at'       => $this->created_at?->toISOString(),
            'messages'         => AiCopilotMessageResource::collection(
                $this->whenLoaded('messages')
            ),
        ];
    }
}
