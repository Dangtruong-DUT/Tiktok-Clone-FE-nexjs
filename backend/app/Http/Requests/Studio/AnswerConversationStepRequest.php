<?php

namespace App\Http\Requests\Studio;

use Illuminate\Foundation\Http\FormRequest;

class AnswerConversationStepRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return [
            'answer' => ['required', 'string', 'max:1000'],
        ];
    }

    public function answer(): string
    {
        return (string) $this->input('answer');
    }
}
