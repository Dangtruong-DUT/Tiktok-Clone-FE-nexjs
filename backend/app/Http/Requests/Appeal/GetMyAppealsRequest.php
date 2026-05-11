<?php

namespace App\Http\Requests\Appeal;

use App\Http\Requests\BaseListRequest;
use Illuminate\Validation\Rule;

class GetMyAppealsRequest extends BaseListRequest
{
    /**
     * Get the validation rules.
     *
     * @return array<string, string|array>
 */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'page' => [self::NULLABLE],
            'per_page' => [self::NULLABLE],
            'appeal_status' => [self::NULLABLE],
            'appeal_type' => [self::NULLABLE],
            'order_by' => [self::NULLABLE, self::ARRAY],
            'order_by.*' => [Rule::in(['created_at', '-created_at'])],
        ]);
    }
}
