<?php

namespace App\Http\Resources\Api\Notification;

use App\Http\Resources\BaseJsonResource;

class NotificationResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'type' => $this->type?->value,
            'type_key' => $this->type?->translate(),
            'is_read' => $this->is_read,
            'data' => $this->data,
            'created_at' => $this->created_at->toDateTimeString(),
            'actor' => NotificationActorResource::make($this->whenLoaded('actor')),
            'entity' => NotificationEntityResource::make($this->whenLoaded('entity')),
        ];
    }
}
