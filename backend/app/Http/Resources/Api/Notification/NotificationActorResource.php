<?php

namespace App\Http\Resources\Api\Notification;

use App\Http\Resources\BaseJsonResource;

class NotificationActorResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'username' => $this->username,
            'avatar' => $this->avatar_url,
            'is_followed' => (bool) ($this->is_followed ?? false),
        ];
    }
}
