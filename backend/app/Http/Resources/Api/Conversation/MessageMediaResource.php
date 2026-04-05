<?php

namespace App\Http\Resources\Api\Conversation;

use App\Http\Resources\BaseJsonResource;

class MessageMediaResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type?->value,
            'type_key' => $this->type?->translate(),
            'order' => $this->order,
            'file' => [
                'id' => $this->uploadFile?->id,
                'uuid' => $this->uploadFile?->uuid,
                'url' => $this->uploadFile?->url,
                'file_name' => $this->uploadFile?->file_name,
                'mime_type' => $this->uploadFile?->mime_type,
                'file_size' => $this->uploadFile?->file_size,
            ],
        ];
    }
}
