<?php

namespace App\Http\Requests\Conversation;

use App\Http\Requests\BaseListRequest;
use App\Rules\ConversationId;

class GetConversationMessagesRequest extends BaseListRequest
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
            'page' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'per_page' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
        ]);
    }
}
