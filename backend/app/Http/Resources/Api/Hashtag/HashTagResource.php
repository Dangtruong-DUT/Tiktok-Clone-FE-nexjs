<?php
namespace App\Http\Resources\Api\Hashtag;

use App\Http\Resources\BaseJsonResource;

class HashtagResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
