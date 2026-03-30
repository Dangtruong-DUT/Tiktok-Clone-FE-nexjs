<?php
namespace App\Http\Resources\Api\Mention;

use App\Http\Resources\BaseJsonResource;

class MentionResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'start' => $this->whenPivotLoaded('posts_mentions', fn () => $this->pivot?->start),
            'end' => $this->whenPivotLoaded('posts_mentions', fn () => $this->pivot?->end),
        ];
    }
}
