<?php

namespace App\Http\Resources\Api\Admin\User;

use App\Http\Resources\BaseJsonResource;

class AdminUserResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'username' => $this->username,
            'email' => $this->email,
            'avatar' => $this->avatar_url,
            'banned_at' => optional($this->banned_at)?->toDateTimeString(),
            'ban_reason' => $this->ban_reason,
            'created_at' => optional($this->created_at)?->toDateTimeString(),
            'deleted_at' => optional($this->deleted_at)?->toDateTimeString(),
        ];
    }
}
