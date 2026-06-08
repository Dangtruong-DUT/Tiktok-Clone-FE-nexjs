<?php

namespace App\Http\Requests\Studio;

use App\Http\Requests\BaseRequest;

class UpdateCopilotMessageStatusRequest extends BaseRequest
{
    protected function prepareForValidation()
    {
        parent::prepareForValidation();
        $this->merge(['message_uuid' => $this->route('messageUuid')]);
    }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'message_uuid' => [self::REQUIRED, self::UUID],
        ]);
    }
}
