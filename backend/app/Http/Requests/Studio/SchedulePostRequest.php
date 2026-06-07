<?php

namespace App\Http\Requests\Studio;

use App\Http\Requests\BaseRequest;

class SchedulePostRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'scheduled_at' => [self::REQUIRED, self::DATE, self::AFTER . ':now'],
            'timezone'     => [self::SOMETIMES, self::NULLABLE, self::STRING, self::MAX . ':100'],
        ]);
    }
}
