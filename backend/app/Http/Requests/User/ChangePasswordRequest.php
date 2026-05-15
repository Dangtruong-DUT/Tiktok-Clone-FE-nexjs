<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class ChangePasswordRequest extends BaseRequest
{
    /**
     * set rules
     */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'current_password' => [
                self::REQUIRED,
            ],
            'password' => [
                self::REQUIRED,
                self::DIFFERENT.':current_password',
            ],
            'confirm_password' => [
                self::REQUIRED,
                self::SAME.':password',
            ],
        ]);
    }
}
