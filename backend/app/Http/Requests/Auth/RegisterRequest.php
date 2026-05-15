<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class RegisterRequest extends BaseRequest
{
    /**
     * set rules
     */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'name' => [self::REQUIRED],
            'email' => [self::REQUIRED],
            'password' => [self::REQUIRED],
            'confirm_password' => [self::REQUIRED],
            'date_of_birth' => [self::REQUIRED],
        ]);
    }
}
