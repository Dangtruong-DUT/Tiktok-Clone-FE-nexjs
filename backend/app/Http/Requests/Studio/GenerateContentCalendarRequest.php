<?php

namespace App\Http\Requests\Studio;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateContentCalendarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return [
            'niche'              => ['required', 'string', 'max:200'],
            'content_style'      => ['sometimes', 'nullable', 'string', 'max:100'],
            'posting_frequency'  => ['sometimes', 'nullable', 'string', 'max:50'],
            'primary_goals'      => ['sometimes', 'array', 'max:5'],
            'primary_goals.*'    => ['string', 'max:100'],
            'target_audience'    => ['sometimes', 'nullable', 'string', 'max:500'],
            'creator_language'   => ['sometimes', 'string', Rule::in(['vi', 'en', 'ja', 'ko', 'zh', 'other'])],
        ];
    }
}
