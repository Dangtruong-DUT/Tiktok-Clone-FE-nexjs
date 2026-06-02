<?php

namespace App\Http\Requests\Wellness;

use Illuminate\Foundation\Http\FormRequest;

class ParseNLRuleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return [
            'text' => ['required', 'string', 'max:500'],
        ];
    }

    public function text(): string
    {
        return (string) $this->input('text');
    }
}
