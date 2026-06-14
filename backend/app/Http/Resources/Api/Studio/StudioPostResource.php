<?php

namespace App\Http\Resources\Api\Studio;

use App\Http\Resources\BaseJsonResource;
use App\Models\Post;
use Illuminate\Http\Request;

/** @mixin Post */
class StudioPostResource extends BaseJsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'uuid'           => $this->uuid,
            'content'        => $this->content,
            'thumbnail_url'  => $this->thumbnail_url,
            'audience'       => $this->audience,
            'status'         => $this->status?->value,
            'status_label'   => $this->status?->translate(),
            'published_at'   => $this->published_at?->toIso8601String(),
            'updated_at'     => $this->updated_at?->toIso8601String(),
            'created_at'     => $this->created_at?->toIso8601String(),
            'scheduled_post' => $this->whenLoaded('scheduledPost', fn () => $this->scheduledPost ? [
                'uuid'          => $this->scheduledPost->uuid,
                'status'        => $this->scheduledPost->status?->value,
                'scheduled_at'  => $this->scheduledPost->scheduled_at?->toIso8601String(),
                'error_message' => $this->scheduledPost->error_message,
            ] : null),
        ];
    }
}
