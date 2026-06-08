<?php

namespace App\Http\Requests\Studio;

use App\Http\Requests\BaseListRequest;

class ListScheduledPostsRequest extends BaseListRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'per_page' => [self::SOMETIMES, self::INTEGER, self::MIN . ':1', self::MAX . ':100'],
        ]);
    }
}
