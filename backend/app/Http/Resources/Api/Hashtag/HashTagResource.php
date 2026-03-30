<?php
namespace App\Http\Resources\Api\Hashtag;

use App\Http\Resources\BaseJsonResource;

class HashtagResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'created_at' => $this->created_at->toDateTimeString(),
            'start' => $this->whenPivotLoaded('posts_hashtags', fn () => $this->pivot?->start),
            'end' => $this->whenPivotLoaded('posts_hashtags', fn () => $this->pivot?->end),
        ];
    }
}
