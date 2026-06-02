<?php

namespace App\Http\Requests\Admin\AiStudio;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GetAiStudioMetricsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return [
            'period' => ['sometimes', 'string', Rule::in(['today', 'week', 'month'])],
        ];
    }

    public function period(): string
    {
        return $this->input('period', 'today');
    }
}
