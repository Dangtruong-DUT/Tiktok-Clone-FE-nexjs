<?php

namespace App\Http\Requests\Admin\System;

use App\Http\Requests\BaseRequest;

class GetDashboardStatsRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'period' => [self::NULLABLE, self::IN.':today,week,month,year'],
        ]);
    }
}
