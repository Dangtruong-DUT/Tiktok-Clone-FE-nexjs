<?php

namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class LogoutRequest extends BaseRequest
{

    /**
     * prepare for validation: merge cookies into request data
     *
     * @return void
     */
    protected function prepareForValidation() {
        parent::prepareForValidation();
        $cookies = request()->cookies->all();
        $this->merge($cookies);
    }


    /**
     * set rules
     */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'refresh_token' => [self::STRING],
        ]);
    }
}
