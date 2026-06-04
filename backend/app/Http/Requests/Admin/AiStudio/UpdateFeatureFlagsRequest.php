<?php

namespace App\Http\Requests\Admin\AiStudio;

use App\Http\Requests\BaseRequest;

class UpdateFeatureFlagsRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'flags'   => [self::REQUIRED, self::ARRAY],
            'flags.*' => [self::BOOLEAN],
        ]);
    }
}
