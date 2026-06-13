<?php

namespace App\Http\Requests\Studio;

use App\Http\Requests\BaseRequest;

class ReschedulePostRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'scheduled_at' => [self::REQUIRED],
        ]);
    }
}
