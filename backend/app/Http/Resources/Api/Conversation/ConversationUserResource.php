<?php

namespace App\Http\Resources\Api\Conversation;

use App\Http\Resources\BaseJsonResource;

class ConversationUserResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'username' => $this->username,
            'name' => $this->name,
            'avatar' => $this->avatar_url,
        ];
    }
}
