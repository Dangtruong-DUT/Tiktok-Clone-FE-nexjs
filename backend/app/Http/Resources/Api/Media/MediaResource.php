<?php

namespace App\Http\Resources\Api\Media;

use App\Http\Resources\BaseJsonResource;

class MediaResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'url' => $this->url,
            'type' => $this->type->value,
        ];
    }
}
