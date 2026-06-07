<?php

namespace App\Http\Requests\Studio;

use App\Http\Requests\BaseRequest;

class StreamCopilotMessageRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'token' => [self::REQUIRED, self::STRING],
        ]);
    }
}
