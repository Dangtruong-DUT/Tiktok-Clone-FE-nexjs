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

    /** Return the raw natural language input text. */
    public function text(): string
    {
        return (string) $this->input('text');
    }
}
