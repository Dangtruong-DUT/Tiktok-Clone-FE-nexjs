<?php

namespace App\Http\Requests\Appeal;

use App\Http\Requests\BaseRequest;

class GuestRequestTokenRequest extends BaseRequest
{
    public function rules(): array
    {
        return $this->applyBaseRules([
            'email' => [self::REQUIRED, 'email', self::MAX.':255'],
            'appeal_type' => [self::REQUIRED],
            'resource_type' => [self::REQUIRED],
            'resource_id' => [self::REQUIRED, self::INTEGER],
        ]);
    }
}
