<?php

namespace App\Http\Requests\Appeal;

use App\Http\Requests\BaseRequest;

/**
 * Validates the token query parameter for appeal link verification.
 */
class ValidateAppealTokenRequest extends BaseRequest
{
    /**
     * Get the validation rules.
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'token' => [self::REQUIRED, self::STRING, self::MIN . ':32', self::MAX . ':128'],
        ]);
    }
}
