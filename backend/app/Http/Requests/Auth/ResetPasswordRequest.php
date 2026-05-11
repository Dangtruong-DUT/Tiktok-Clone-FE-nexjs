<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class ResetPasswordRequest extends BaseRequest
{
    /**
     * set rules
 */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'forgot_password_token' => [self::REQUIRED],
            'password' => [self::REQUIRED],
            'confirm_password' => [self::REQUIRED],
        ]);
    }
}
