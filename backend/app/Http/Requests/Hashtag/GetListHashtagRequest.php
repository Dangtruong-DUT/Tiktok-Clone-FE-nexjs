<?php

namespace App\Http\Requests\Hashtag;

use App\Http\Requests\BaseListRequest;

class GetListHashtagRequest extends BaseListRequest
{
    /**
     * set rules
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'q' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'page' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'per_page' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
        ]);
    }
}
