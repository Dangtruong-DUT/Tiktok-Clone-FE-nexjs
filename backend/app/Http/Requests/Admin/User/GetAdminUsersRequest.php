<?php

namespace App\Http\Requests\Admin\User;

use App\Http\Requests\Admin\BaseAdminRequest;
use Illuminate\Validation\Rule;

/**
 * Get list of users with filtering and pagination
 * Used by: GET /admin/users
 */
class GetAdminUsersRequest extends BaseAdminRequest
{
    protected array $casts = [
        'page' => 'int',
        'per_page' => 'int',
    ];

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'search' => 'nullable|string|max:100',
            'status' => [
                'nullable',
                Rule::in(['active', 'banned', 'all']),
            ],
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => [
                'nullable',
                Rule::in(['id', 'username', 'email', 'created_at', '-id', '-username', '-email', '-created_at']),
            ],
        ]);
    }
}
