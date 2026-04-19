<?php

namespace App\Http\Resources\Api\Admin\System;

use App\Http\Resources\BaseJsonResource;

class ActivityLogResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user_uuid' => $this->whenLoaded('user', fn () => $this->user?->uuid),
            'action_type' => $this->activity_type?->value ?? $this->activity_type,
            'resource_type' => $this->resource_type?->value ?? $this->resource_type,
            'resource_id' => $this->resource_id,
            'metadata' => $this->metadata,
            'ip_address' => $this->ip_address,
            'created_at' => optional($this->created_at)?->toDateTimeString(),
            'user' => $this->whenLoaded('user', function () {
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
