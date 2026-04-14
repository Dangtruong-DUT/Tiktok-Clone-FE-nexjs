<?php

namespace App\Http\Requests\Admin\User;

use App\Http\Requests\Admin\BaseAdminRequest;
use Illuminate\Validation\Rule;

/**
 * Send custom mail to a user by admin
 * Used by: POST /admin/users/{user_id}/send-mail
 */
class SendUserMailRequest extends BaseAdminRequest
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
            'subject' => 'required|string|min:3|max:150',
            'message' => 'required|string|min:10|max:5000',
        ]);
    }
}
