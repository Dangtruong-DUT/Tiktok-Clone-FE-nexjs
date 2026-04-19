<?php

namespace App\Http\Resources\Api\Admin\System;

use App\Http\Resources\BaseJsonResource;

class AdminLogResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'admin_id' => $this->admin_id,
            'admin_uuid' => $this->whenLoaded('admin', fn () => $this->admin?->uuid),
            'action' => $this->action?->value ?? $this->action,
            'resource_type' => $this->resource_type?->value ?? $this->resource_type,
            'resource_id' => $this->resource_id,
            'reason' => $this->reason,
            'old_data' => $this->old_data,
            'new_data' => $this->new_data,
            'ip_address' => $this->ip_address,
            'created_at' => optional($this->created_at)?->toDateTimeString(),
            'admin' => $this->whenLoaded('admin', function () {
                return [
                    'id' => $this->admin?->id,
                    'uuid' => $this->admin?->uuid,
                    'username' => $this->admin?->username,
                    'avatar' => $this->admin?->avatar_url,
                ];
            }),
        ];
    }
}
