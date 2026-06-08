<?php

namespace App\Http\Resources\Api\Admin\Comment;

use App\Http\Resources\BaseJsonResource;

class AdminCommentResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        $user = $this->relationLoaded('user') ? $this->user : null;
        $avatar = null;
        if ($user && $user->relationLoaded('avatarFile')) {
            $avatar = $user->avatar_url;
        }

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'user_id' => $this->user_id,
            'user_uuid' => $this->whenLoaded('user', fn () => $this->user?->uuid),
            'parent_id' => $this->parent_id,
            'parent_uuid' => $this->whenLoaded('parent', fn () => $this->parent?->uuid),
            'content' => $this->content,
            'likes_count' => $this->likes_count,
            'created_at' => optional($this->created_at)?->toDateTimeString(),
            'author' => $this->whenLoaded('user', function () use ($avatar) {
                return [
                    'id' => $this->user?->id,
                    'uuid' => $this->user?->uuid,
                    'username' => $this->user?->username,
                    'avatar' => $avatar,
                ];
            }),
        ];
    }
}
