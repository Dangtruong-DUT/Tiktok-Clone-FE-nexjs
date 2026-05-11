<?php

namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class FollowSomeOneRequest extends BaseRequest
{
    protected function prepareForValidation()
    {
        parent::prepareForValidation();
        $this->merge(
            [
                'user_uuid' => $this->route('user_uuid'),
            ]
        );
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
