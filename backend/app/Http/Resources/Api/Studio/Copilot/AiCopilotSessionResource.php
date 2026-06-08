<?php

namespace App\Http\Resources\Api\Studio\Copilot;

use App\Http\Resources\BaseJsonResource;
use App\Models\AiCopilotSession;
use Illuminate\Http\Request;

/** @mixin AiCopilotSession */
class AiCopilotSessionResource extends BaseJsonResource
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
