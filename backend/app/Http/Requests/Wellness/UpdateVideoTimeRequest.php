<?php

namespace App\Http\Requests\Wellness;

use App\Http\Requests\BaseRequest;

class UpdateVideoTimeRequest extends BaseRequest
{
    /** @return array<string,mixed> */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'video_seconds' => [self::REQUIRED, self::INTEGER, self::MIN . ':0', self::MAX . ':86400'],
        ]);
    }
}
