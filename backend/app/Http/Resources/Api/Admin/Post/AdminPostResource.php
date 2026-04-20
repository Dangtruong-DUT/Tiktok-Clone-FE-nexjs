<?php

namespace App\Http\Resources\Api\Admin\Post;

use App\Http\Resources\BaseJsonResource;

class AdminPostResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'user_id' => $this->user_id,
            'user_uuid' => $this->whenLoaded('user', fn () => $this->user?->uuid),
            'content' => $this->content,
            'deleted_at' => optional($this->deleted_at)?->toDateTimeString(),
            'created_at' => optional($this->created_at)?->toDateTimeString(),
            'author' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user?->id,
                    'uuid' => $this->user?->uuid,
                    'username' => $this->user?->username,
                    'avatar' => $this->user?->avatar_url,
                ];
            }),
        ];
    }
}
