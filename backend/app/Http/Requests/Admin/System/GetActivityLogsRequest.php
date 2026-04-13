<?php

namespace App\Http\Requests\Admin\System;

use App\Enums\Admin\AdminResourceEnum;
use App\Http\Requests\Admin\BaseAdminRequest;
use Illuminate\Validation\Rule;

/**
 * Get activity/admin logs with filtering
 * Used by: GET /admin/activity-logs
 */
class GetActivityLogsRequest extends BaseAdminRequest
{
    protected array $casts = [
        'page' => 'int',
        'per_page' => 'int',
    ];

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'log_type' => [
                'nullable',
                Rule::in(['admin', 'activity']), // admin_logs or activity_logs
            ],
            'action_type' => 'nullable|string|max:50',
            'admin_id' => 'nullable|integer|exists:users,id',
            'user_id' => 'nullable|integer|exists:users,id',
            'resource_type' => [
                'nullable',
                'string',
                'in:' . implode(',', AdminResourceEnum::values()),
            ],
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => [
                'nullable',
                Rule::in(['id', 'created_at', '-id', '-created_at']),
            ],
        ]);
    }
}
