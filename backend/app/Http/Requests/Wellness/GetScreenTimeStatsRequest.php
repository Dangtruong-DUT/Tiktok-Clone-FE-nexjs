<?php

namespace App\Http\Requests\Wellness;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class GetScreenTimeStatsRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'period' => [self::SOMETIMES, self::STRING, Rule::in(['today', 'week', 'month'])],
        ]);
    }
}
