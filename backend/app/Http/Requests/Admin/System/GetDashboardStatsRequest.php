<?php

namespace App\Http\Requests\Admin\System;

use App\Http\Requests\Admin\BaseAdminRequest;

/**
 * Get dashboard statistics
 * Used by: GET /admin/dashboard/stats
 */
class GetDashboardStatsRequest extends BaseAdminRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'period' => 'nullable|in:today,week,month,year',
        ]);
    }
}
