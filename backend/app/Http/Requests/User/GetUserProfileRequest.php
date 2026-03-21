<?php
namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class GetUserProfileRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'username' => $this->route('username'),
        ]);
    }

    /**
     * set rules
     *
     * @return array
     */
    public function rules(): array
    {

        return $this->applyBaseRules([
                'username'=>[
                    self::REQUIRED
                ]
        ]);
    }
}
