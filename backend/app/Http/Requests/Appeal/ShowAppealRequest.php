<?php

namespace App\Http\Requests\Appeal;

use App\Http\Requests\BaseRequest;

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
        ]);
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'appeal_uuid' => $this->route('appeal_uuid'),
        ]);
    }
}
