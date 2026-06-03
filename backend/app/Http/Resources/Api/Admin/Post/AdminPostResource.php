<?php

namespace App\Http\Resources\Api\Admin\Post;

use App\Http\Resources\BaseJsonResource;

class AdminPostResource extends BaseJsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        $user = $this->relationLoaded('user') ? $this->user : null;
        $avatar = null;
        if ($user && $user->relationLoaded('avatarFile')) {
            $avatar = $user->avatar_url;
        }

        return [
            'id'           => $this->id,
            'uuid'         => $this->uuid,
            'user_id'      => $this->user_id,
            'user_uuid'    => $this->whenLoaded('user', fn () => $this->user?->uuid),
            'content'      => $this->content,
            'status'       => $this->status?->value ?? $this->status,
            'status_label' => $this->status?->translate() ?? null,
            'published_at' => $this->published_at?->toDateTimeString(),
            'deleted_at'   => $this->deleted_at?->toDateTimeString(),
            'created_at'   => $this->created_at?->toDateTimeString(),
            'author'       => $this->whenLoaded('user', function () use ($avatar) {
                return [
                    'id'       => $this->user?->id,
                    'uuid'     => $this->user?->uuid,
                    'username' => $this->user?->username,
                    'avatar'   => $avatar,
                ];
            }),
        ];
    }
}
