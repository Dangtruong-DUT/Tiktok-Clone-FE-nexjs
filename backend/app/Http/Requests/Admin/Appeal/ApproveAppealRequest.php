<?php

namespace App\Http\Requests\Admin\Appeal;

use App\Http\Requests\BaseRequest;

class ApproveAppealRequest extends BaseRequest
{
    /**
     * Prepare the data for validation.
     * Extract appeal_uuid from route and merge into request data
 */
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'appeal_uuid' => $this->route('appeal_uuid'),
        ]);
    }

    /**
     * Get the validation rules.
     *
     * @return array<string, string|array>
 */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'appeal_uuid' => [self::REQUIRED],
            'admin_response' => [self::NULLABLE, self::STRING, self::MAX.':500'],
        ]);
    }
}
