<?php

namespace App\Http\Requests\Conversation;

use App\Http\Requests\BaseListRequest;

class GetConversationListRequest extends BaseListRequest
{
    public function rules(): array
    {
        return $this->applyBaseRules([
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
