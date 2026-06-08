<?php

namespace App\Http\Resources\Api\Admin;

use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class AiCopilotSessionAdminResource extends BaseJsonResource
{
    /**
     * @return array<string,mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'uuid'             => $this->uuid,
            'user_id'          => $this->user_id,
            'context_snapshot' => $this->context_snapshot,
            'is_large_video'   => (bool) $this->is_large_video,
            'expires_at'       => $this->expires_at?->toISOString(),
            'created_at'       => $this->created_at?->toISOString(),
            'user'             => $this->when($this->relationLoaded('user') && $this->user, [
                'uuid'     => $this->user->uuid,
                'username' => $this->user->username,
            ]),
        ];
    }
}
