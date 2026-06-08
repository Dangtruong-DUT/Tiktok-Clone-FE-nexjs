<?php

namespace App\Http\Requests\Wellness;

use App\Http\Requests\BaseRequest;

class EndSessionRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'duration_seconds' => [self::REQUIRED, self::INTEGER, self::MIN . ':0'],
        ]);
    }
}
