<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class ForgotPasswordRequest extends BaseRequest
{
    /**
     * set rules
 */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'email' => [self::REQUIRED],
        ]);
    }
}
