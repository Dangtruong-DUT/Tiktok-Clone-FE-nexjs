<?php

namespace App\Http\Resources\Api\Studio;

use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class ScheduledPostResource extends BaseJsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'uuid'           => $this->uuid,
            'status'         => $this->status?->value ?? $this->status,
            'status_label'   => $this->status?->translate() ?? null,
            'source'         => $this->source?->value ?? $this->source,
            'scheduled_at'   => $this->scheduled_at?->toIso8601String(),
            'published_at'   => $this->published_at?->toIso8601String(),
            'error_message'  => $this->when(
                $this->status?->value === 'failed',
                $this->error_message
            ),
            'post'           => $this->whenLoaded('post', fn () => [
                'uuid'    => $this->post->uuid,
                'content' => $this->post->content,
                'status'  => $this->post->status?->value,
            ]),
            'created_at'     => $this->created_at->toIso8601String(),
        ];
    }
}
