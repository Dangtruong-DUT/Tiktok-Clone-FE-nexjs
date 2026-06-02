<?php

namespace App\Http\Requests\Studio;

use Illuminate\Foundation\Http\FormRequest;

class AnalyzeViralScoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return [
            'caption'      => ['required', 'string', 'max:2000'],
            'hashtags'     => ['sometimes', 'array', 'max:30'],
            'hashtags.*'   => ['string', 'max:100'],
            'post_uuid'    => ['sometimes', 'nullable', 'string', 'exists:posts,uuid'],
        ];
    }
}
