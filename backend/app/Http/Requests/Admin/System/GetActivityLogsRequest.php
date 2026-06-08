<?php

namespace App\Http\Requests\Admin\System;

use App\Http\Requests\BaseListRequest;
use Illuminate\Validation\Rule;

/**
 * Get activity/admin logs with filtering
 * Used by: GET /admin/activity-logs
 */
class GetActivityLogsRequest extends BaseListRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'log_type' => [
                self::NULLABLE,
                Rule::in(['admin', 'activity']),
            ],
            'action_type' => [self::NULLABLE],
            'admin_uuid' => [self::NULLABLE],
            'user_uuid' => [self::NULLABLE],
            'resource_type' => [
                self::NULLABLE,
            ],
            'date_from' => [self::NULLABLE],
            'date_to' => [self::NULLABLE],
            'page' => [self::NULLABLE],
            'per_page' => [self::NULLABLE],
            'order_by' => [
                self::NULLABLE,
                self::ARRAY,
            ],
            'order_by.*' => [Rule::in(['id', 'created_at', '-id', '-created_at'])],
        ]);
    }
}
