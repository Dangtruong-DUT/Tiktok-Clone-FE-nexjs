<?php

namespace App\Http\Requests\Admin\User;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class GetAdminUsersRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'q' => [self::NULLABLE],
            'status' => [
                self::NULLABLE,
                Rule::in(['active', 'banned', 'all']),
            ],
            'page' => [self::NULLABLE],
            'per_page' => [self::NULLABLE],
            'order_by' => [
                self::NULLABLE,
                Rule::in(['id', 'username', 'email', 'created_at', '-id', '-username', '-email', '-created_at']),
            ],
        ]);
    }
}
