<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class UpdateMeRequest extends BaseRequest
{
    /**
     * set rules
     */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'name' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'date_of_birth' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'bio' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'location' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'website' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'username' => [
                self::SOMETIMES,
                self::REQUIRED,
                'unique:users,username,'.auth_user_id(),
            ],
            'avatar_file_id' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
        ]);
    }
}
