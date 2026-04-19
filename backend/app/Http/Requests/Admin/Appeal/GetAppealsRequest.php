<?php

namespace App\Http\Requests\Admin\Appeal;

use App\Http\Requests\BaseListRequest;

class GetAppealsRequest extends BaseListRequest
{
    /**
     * Get the validation rules.
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        return  $this->applyBaseRules([
            'page' => [self::NULLABLE],
            'per_page' => [self::NULLABLE],
            'appeal_status' => [self::NULLABLE],
            'appeal_type' => [self::NULLABLE],
            'order_by' => [self::NULLABLE, 'in:recent,oldest'],
        ]);
    }
}

