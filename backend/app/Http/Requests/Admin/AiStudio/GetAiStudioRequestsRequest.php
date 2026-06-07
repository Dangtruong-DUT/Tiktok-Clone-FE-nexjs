<?php

namespace App\Http\Requests\Admin\AiStudio;

use App\Http\Requests\BaseListRequest;

class GetAiStudioRequestsRequest extends BaseListRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'intent'    => [self::SOMETIMES, self::STRING, self::MAX . ':100'],
            'status'    => [self::SOMETIMES, self::STRING, self::MAX . ':50'],
            'date_from' => [self::SOMETIMES, self::DATE],
            'date_to'   => [self::SOMETIMES, self::DATE],
            'per_page'  => [self::SOMETIMES, self::INTEGER, self::MIN . ':1', self::MAX . ':100'],
        ]);
    }
}
