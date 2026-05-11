<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class VerifyEmailRequest extends BaseRequest
{
    /**
     * set rules
 */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'email_verify_token' => [self::REQUIRED],
        ]);
    }
}
