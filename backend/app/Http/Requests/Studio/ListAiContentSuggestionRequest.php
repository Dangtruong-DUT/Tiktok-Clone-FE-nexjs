<?php

namespace App\Http\Requests\Studio;

use App\Http\Requests\BaseListRequest;

class ListAiContentSuggestionRequest extends BaseListRequest
{
    public function rules(): array
    {
        return $this->applyBaseRules([
            'page'     => [self::NULLABLE, self::INTEGER, self::MIN . ':1'],
            'per_page' => [self::NULLABLE, self::INTEGER, self::MIN . ':1', self::MAX . ':50'],
        ]);
    }
}
