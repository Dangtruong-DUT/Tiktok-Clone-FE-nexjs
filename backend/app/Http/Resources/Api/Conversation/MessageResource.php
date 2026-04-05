<?php

namespace App\Http\Resources\Api\Conversation;

use App\Http\Resources\BaseJsonResource;

class MessageResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'sender_id' => $this->sender_id,
            'content' => $this->content,
            'type' => $this->type?->value,
            'type_key' => $this->type?->translate(),
            'reply_to_id' => $this->reply_to_id,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'sender' => ConversationUserResource::make($this->whenLoaded('sender')),
            'medias' => MessageMediaResource::collection($this->whenLoaded('medias')),
            'reply_to' => $this->whenLoaded('replyTo', function (): ?array {
                if (!$this->replyTo) {
                    return null;
                }

                return [
                    'id' => $this->replyTo->id,
                    'content' => $this->replyTo->content,
                    'sender_id' => $this->replyTo->sender_id,
                ];
            }),
        ];
    }
}
