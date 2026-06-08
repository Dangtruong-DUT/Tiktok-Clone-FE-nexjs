<?php

namespace App\Http\Requests\Admin\AiCopilot;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class GetAiCopilotMetricsRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'period' => [self::SOMETIMES, self::STRING, Rule::in(['today', 'week', 'month'])],
        ]);
    }
}
