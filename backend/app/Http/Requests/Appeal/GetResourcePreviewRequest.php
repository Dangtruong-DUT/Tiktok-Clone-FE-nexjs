<?php

namespace App\Http\Requests\Appeal;

use App\Enums\Common\ResourceTypeEnum;
use App\Http\Requests\BaseRequest;

class GetResourcePreviewRequest extends BaseRequest
{
    public function rules(): array
    {
        return $this->applyBaseRules([
            'resource_type' => [self::REQUIRED, self::STRING, 'in:' . implode(',', ResourceTypeEnum::values())],
            'resource_uuid' => [self::NULLABLE, self::STRING, 'uuid'],
        ]);
    }
}
