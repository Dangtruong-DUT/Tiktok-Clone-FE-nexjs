<?php

namespace App\Http\Requests\Wellness;

use App\Enums\Wellness\WellnessActionEnum;
use App\Enums\Wellness\WellnessRuleTypeEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class SaveWellnessRuleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    /** @return array<string,mixed> */
    public function rules(): array
    {
        $presence = $this->isMethod('PUT') ? 'sometimes' : 'required';

        return [
            'type'                   => [$presence, 'string', new Enum(WellnessRuleTypeEnum::class)],
            'conditions'             => [$presence, 'array'],
            'action'                 => [$presence, 'string', new Enum(WellnessActionEnum::class)],
            'title'                  => [$presence, 'string', 'max:200'],
            'message'                => [$presence, 'string', 'max:500'],
            'is_enabled'             => ['sometimes', 'boolean'],
            'natural_language_input' => ['sometimes', 'nullable', 'string', 'max:500'],
        ];
    }
}
