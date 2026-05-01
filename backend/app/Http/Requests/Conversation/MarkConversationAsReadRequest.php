<?php

namespace App\Http\Requests\Conversation;

use App\Http\Requests\BaseRequest;
use App\Rules\ConversationId;

class MarkConversationAsReadRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'conversation_id' => $this->route('conversation_id'),
        ]);
    }

    public function rules(): array
    {
        return $this->applyBaseRules([
            'conversation_id' => [
                self::REQUIRED,
                self::INTEGER,
                new ConversationId,
            ],
        ]);
    }
}
