<?php

namespace App\Http\Resources\Api\Notification;

use App\Models\Hashtag;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationEntityResource extends JsonResource
{
    public function toArray($request): array
    {
        if ($this->resource instanceof Post) {
            return [
                'id' => $this->resource->id,
                'type' => 'post',
                'uuid' => $this->resource->uuid,
                'thumbnail_url' => $this->resource->thumbnail_url,
                'content' => $this->resource->content,
                'is_deleted' => $this->resource->deleted_at !== null,
            ];
        }

        if ($this->resource instanceof User) {
            return [
                'id' => $this->resource->id,
                'type' => 'user',
                'uuid' => $this->resource->uuid,
                'username' => $this->resource->username,
                'avatar' => $this->resource->avatar_url,
                'is_deleted' => $this->resource->deleted_at !== null,
            ];
        }

        if ($this->resource instanceof Hashtag) {
            return [
                'id' => $this->resource->id,
                'type' => 'hashtag',
                'name' => $this->resource->name,
            ];
        }

        return [];
    }
}
