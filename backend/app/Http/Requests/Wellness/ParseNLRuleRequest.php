<?php

namespace App\Http\Requests\Wellness;

use App\Http\Requests\BaseRequest;

class ParseNLRuleRequest extends BaseRequest
{
    /**
     * Validate the natural language rule text to parse.
     *
     * @return array<string, mixed[]>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'text' => [self::REQUIRED, self::STRING, self::MAX . ':500'],
        ]);
    }
}
