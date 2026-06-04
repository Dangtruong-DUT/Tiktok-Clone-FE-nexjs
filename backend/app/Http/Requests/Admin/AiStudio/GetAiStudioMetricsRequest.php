<?php

namespace App\Http\Requests\Admin\AiStudio;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class GetAiStudioMetricsRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'period' => [self::SOMETIMES, self::STRING, Rule::in(['today', 'week', 'month'])],
        ]);
    }

    public function period(): string
    {
        return $this->input('period', 'today');
    }
}
