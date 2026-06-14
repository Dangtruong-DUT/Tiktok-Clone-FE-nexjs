<?php

namespace App\Http\Resources\Api\Admin;

use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class ScheduledPostAdminResource extends BaseJsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'uuid'          => $this->uuid,
            'status'        => $this->status?->value ?? $this->status,
            'status_label'  => $this->status?->translate() ?? null,
            'source'        => $this->source?->value ?? $this->source,
            'scheduled_at'  => $this->scheduled_at?->toIso8601String(),
            'published_at'  => $this->published_at?->toIso8601String(),
            'error_message' => $this->error_message,
            'user'          => $this->whenLoaded('user', fn () => [
                'uuid'     => $this->user->uuid,
                'username' => $this->user->username,
                'name'     => $this->user->name,
            ]),
            'post'          => $this->whenLoaded('post', fn () => [
                'uuid'    => $this->post->uuid,
                'status'  => $this->post->status?->value,
                'content' => mb_substr($this->post->content ?? '', 0, 200),
            ]),
            'created_at'    => $this->created_at->toIso8601String(),
        ];
    }
}
