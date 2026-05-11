<?php

namespace App\Http\Requests\Admin\User;

use App\Http\Requests\BaseRequest;

class ResetUserPasswordRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'user_uuid' => $this->route('user_uuid'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
 */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'user_uuid' => [
                self::REQUIRED,
            ],
            'password' => [self::REQUIRED],
            'confirm_password' => [self::REQUIRED],
        ]);
    }
}
