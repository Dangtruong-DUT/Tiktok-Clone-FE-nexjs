<?php

namespace App\Http\Requests\Appeal;

use App\Http\Requests\BaseRequest;

class CreateAppealRequest extends BaseRequest
{
    /**
     * Get the validation rules.
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'appeal_type' => [self::NULLABLE],
            'resource_id' => [self::NULLABLE],
            'reason' => [self::REQUIRED, self::STRING, self::MIN . ':20', self::MAX . ':1000'],
        ]);
    }
}
