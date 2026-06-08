<?php

namespace App\Http\Requests\Wellness;

use App\Http\Requests\BaseRequest;

class GetScreenTimeHistoryRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'date_from' => [self::SOMETIMES, self::DATE],
            'date_to'   => [self::SOMETIMES, self::DATE],
        ]);
    }
}
