<?php

namespace App\Http\Resources\Api\Conversation;

use App\Http\Resources\BaseJsonResource;

class ConversationResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type?->value,
            'type_key' => $this->type?->translate(),
            'unread_count' => (int) ($this->unread_count ?? 0),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'participants' => ConversationParticipantResource::collection($this->whenLoaded('participants')),
            'last_message' => MessageResource::make($this->whenLoaded('latestMessage')),
        ];
    }
}
