<?php

namespace App\Http\Requests\Admin\User;

use App\Http\Requests\Admin\BaseAdminRequest;
use Illuminate\Validation\Rule;

/**
 * Ban a user account
 * Used by: POST /admin/users/{user_id}/ban
 */
class BanUserRequest extends BaseAdminRequest
{
    protected array $casts = [
        'duration_days' => 'int',
    ];

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
                Rule::notIn([$this->user()?->id]), // Can't ban self
            ],
            'reason' => 'required|string|min:10|max:500',
            'duration_days' => 'nullable|integer|min:1|max:365',
        ]);
    }
}
