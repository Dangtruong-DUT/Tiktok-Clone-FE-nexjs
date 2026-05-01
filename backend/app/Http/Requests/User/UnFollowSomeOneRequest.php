<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class UnFollowSomeOneRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $this->merge([
            'user_uuid' => $this->route('user_uuid'),
        ]);
    }

    /**
     * set rules
     */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'user_uuid' => [
                self::REQUIRED,
            ],
        ]);
    }
}
