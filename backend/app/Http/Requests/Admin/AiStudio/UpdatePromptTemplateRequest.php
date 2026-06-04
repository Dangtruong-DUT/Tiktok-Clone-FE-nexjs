<?php

namespace App\Http\Requests\Admin\AiStudio;

use App\Http\Requests\BaseRequest;

class UpdatePromptTemplateRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'display_name'      => [self::SOMETIMES, self::STRING, self::MAX . ':150'],
            'system_prompt'     => [self::SOMETIMES, self::STRING],
            'user_template'     => [self::SOMETIMES, self::STRING],
            'few_shot_examples' => [self::SOMETIMES, self::NULLABLE, self::ARRAY],
            'is_active'         => [self::SOMETIMES, self::BOOLEAN],
        ]);
    }
}
