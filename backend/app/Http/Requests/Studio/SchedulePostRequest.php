<?php

namespace App\Http\Requests\Studio;

use Illuminate\Foundation\Http\FormRequest;

class SchedulePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return [
            'scheduled_at' => ['required', 'date', 'after:now'],
            'timezone'     => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }

    public function scheduledAt(): string
    {
        return (string) $this->input('scheduled_at');
    }

    public function timezone(): string
    {
        return (string) $this->input('timezone', 'UTC');
    }
}
