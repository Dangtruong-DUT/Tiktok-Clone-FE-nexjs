<?php

namespace App\Http\Requests\Admin\Appeal;

use App\Enums\Appeal\AppealTypeEnum;
use App\Enums\Appeal\AppealStatusEnum;
use App\Http\Requests\Admin\BaseAdminRequest;

/**
 * GetAppealsRequest - Admin views all pending appeals
 */
class GetAppealsRequest extends BaseAdminRequest
{
    /**
     * Get the validation rules.
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        return [
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'status' => ['nullable', 'in:' . implode(',', array_map(fn($e) => $e->value, AppealStatusEnum::cases()))],
            'appeal_type' => ['nullable', 'in:' . implode(',', array_map(fn($e) => $e->value, AppealTypeEnum::cases()))],
            'sort_by' => ['nullable', 'in:recent,oldest'],
        ];
    }

    /**
     * Get custom messages.
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'status.in' => 'Status must be pending, approved, or rejected',
            'appeal_type.in' => 'Invalid appeal type',
            'sort_by.in' => 'Sort by must be recent or oldest',
            'per_page.max' => 'Per page cannot exceed 50',
        ];
    }
}

