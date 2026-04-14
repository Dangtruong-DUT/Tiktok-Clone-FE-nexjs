<?php

namespace App\Http\Requests\Admin\User;

use App\Http\Requests\Admin\BaseAdminRequest;
use Illuminate\Validation\Rule;

/**
 * Reset user password by admin
 * Used by: POST /admin/users/{user_id}/reset-password
 */
class ResetUserPasswordRequest extends BaseAdminRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'user_id' => $this->route('user_id'),
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
            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id'),
            ],
            'password' => 'required|string|min:8|max:100|confirmed',
            'password_confirmation' => 'required|string|min:8|max:100',
        ]);
    }
}
