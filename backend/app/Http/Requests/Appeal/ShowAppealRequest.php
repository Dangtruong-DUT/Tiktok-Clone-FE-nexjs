<?php

namespace App\Http\Requests\Appeal;

use App\Http\Requests\BaseRequest;

/**
 * Validates the show appeal request.
 * Accepts appeal_uuid from route and optional token from query.
 */
class ShowAppealRequest extends BaseRequest
{
    /**
     * Get the validation rules.
     *
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'appeal_uuid' => [self::REQUIRED, self::STRING, self::UUID],
            'token' => [self::NULLABLE, self::STRING, self::MIN.':32', self::MAX.':128'],
        ]);
    }

    /**
     * Merge route parameters into the request data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'appeal_uuid' => $this->route('appeal_uuid'),
        ]);
    }
}
