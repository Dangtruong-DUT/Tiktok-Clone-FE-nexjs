<?php

namespace App\Http\Requests\Admin\AiStudio;

use App\Http\Requests\BaseListRequest;
use Illuminate\Validation\Rule;

class ListAiSuggestionsAdminRequest extends BaseListRequest
{
    public function rules(): array
    {
        return $this->applyBaseRules([
            'status'    => [self::NULLABLE, self::STRING, Rule::in(['pending', 'processing', 'completed', 'failed'])],
            'user_uuid' => [self::NULLABLE, self::STRING, self::UUID],
            'date_from' => [self::NULLABLE, self::DATE_FORMAT . ':Y-m-d'],
            'date_to'   => [self::NULLABLE, self::DATE_FORMAT . ':Y-m-d'],
            'page'      => [self::NULLABLE, self::INTEGER, self::MIN . ':1'],
            'per_page'  => [self::NULLABLE, self::INTEGER, self::MIN . ':1', self::MAX . ':100'],
        ]);
    }
}
