<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class LoginRequest extends BaseRequest
{
    /**
     * set rules
 */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'email' => [self::REQUIRED],
            'password' => [self::REQUIRED],
        ]);
    }
}
