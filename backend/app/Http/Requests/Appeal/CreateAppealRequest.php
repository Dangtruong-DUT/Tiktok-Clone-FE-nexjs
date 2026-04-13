<?php

namespace App\Http\Requests\Appeal;

use App\Enums\Admin\AdminResourceEnum;
use App\Enums\Appeal\AppealTypeEnum;

/**
 * CreateAppealRequest - User files an appeal for ban/hidden/deleted content
 */
class CreateAppealRequest extends BaseAppealRequest
{
    /**
     * Get the validation rules.
     * @return array<string, string|array>
     */
    public function rules(): array
    {
        return [
            'appeal_type' => ['required', 'in:' . implode(',', array_map(fn($e) => $e->value, AppealTypeEnum::cases()))],
            'resource_id' => ['nullable', 'integer'],
            'resource_type' => ['required', 'string', 'in:' . implode(',', AdminResourceEnum::appealValues())],
            'reason' => ['required', 'string', 'min:20', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validation errors
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'appeal_type.required' => 'Appeal type is required',
            'appeal_type.in' => 'Invalid appeal type',
            'resource_type.required' => 'Resource type is required',
            'reason.required' => 'Appeal reason is required',
            'reason.min' => 'Appeal reason must be at least 20 characters',
        ];
    }
}
