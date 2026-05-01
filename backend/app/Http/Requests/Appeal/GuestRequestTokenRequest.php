<?php

namespace App\Http\Requests\Appeal;

use App\Enums\Appeal\AppealTypeEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rules\Enum;

class GuestRequestTokenRequest extends BaseRequest
{
    public function rules(): array
    {
        return $this->applyBaseRules([
            'email' => [self::REQUIRED, 'email', self::MAX.':255'],
            'appeal_type' => [self::REQUIRED, new Enum(AppealTypeEnum::class)],
            'resource_type' => [self::REQUIRED, new Enum(ModelEntityTypeEnum::class)],
            'resource_id' => [self::REQUIRED, self::INTEGER],
        ]);
    }
}
