<?php

namespace App\Http\Requests\Wellness;

use App\Enums\Wellness\WellnessActionEnum;
use App\Enums\Wellness\WellnessRuleTypeEnum;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rules\Enum;

class SaveWellnessRuleRequest extends BaseRequest
{
    /**
     * Build validation rules; presence is 'sometimes' on PUT (partial update) and 'required' otherwise.
     *
     * @return array<string, mixed[]>
     */
    public function rules(): array
    {
        $presence = $this->isMethod('PUT') ? self::SOMETIMES : self::REQUIRED;

        return $this->applyBaseRules([
            'type'                   => [$presence, self::STRING, new Enum(WellnessRuleTypeEnum::class)],
            'conditions'             => [$presence, self::ARRAY],
            'action'                 => [$presence, self::STRING, new Enum(WellnessActionEnum::class)],
            'title'                  => [$presence, self::STRING, self::MAX . ':200'],
            'message'                => [$presence, self::STRING, self::MAX . ':500'],
            'is_enabled'             => [self::SOMETIMES, self::BOOLEAN],
            'natural_language_input' => [self::SOMETIMES, self::NULLABLE, self::STRING, self::MAX . ':500'],
        ]);
    }
}
