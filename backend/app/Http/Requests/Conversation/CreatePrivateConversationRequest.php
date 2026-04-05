<?php

namespace App\Http\Requests\Conversation;

use App\Http\Requests\BaseRequest;

class CreatePrivateConversationRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'current_user_id' => auth_user_id(),
        ]);
    }

    public function rules(): array
    {
        return $this->applyBaseRules([
            'user_uuid' => [
                self::REQUIRED,
                self::STRING,
            ],
            'current_user_id' => [
                self::SOMETIMES,
                self::INTEGER,
            ],
        ]);
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if ((string) $this->input('user_uuid') === (string) auth('api')->user()?->uuid) {
                $validator->errors()->add('user_uuid', 'The user_uuid must be different from current user.');
            }
        });
    }
}
