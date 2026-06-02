<?php

namespace App\Http\Requests\Wellness;

use Illuminate\Foundation\Http\FormRequest;

class EndSessionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return [
            'duration_seconds' => ['required', 'integer', 'min:0'],
        ];
    }

    public function durationSeconds(): int
    {
        return (int) $this->input('duration_seconds');
    }
}
