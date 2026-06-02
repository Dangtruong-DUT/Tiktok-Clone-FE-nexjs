<?php

namespace App\Http\Requests\Studio;

use Illuminate\Foundation\Http\FormRequest;

class StartCreatorConversationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        return [
            'initial_prompt' => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    public function initialPrompt(): ?string
    {
        $v = $this->input('initial_prompt');

        return is_string($v) && trim($v) !== '' ? trim($v) : null;
    }
}
