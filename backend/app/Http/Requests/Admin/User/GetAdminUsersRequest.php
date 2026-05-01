<?php

namespace App\Http\Requests\Admin\User;

use App\Http\Requests\BaseListRequest;
use Illuminate\Validation\Rule;

class GetAdminUsersRequest extends BaseListRequest
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
                Rule::in(['active', 'banned', 'deleted', 'all']),
            ],
            'page' => [self::NULLABLE],
            'per_page' => [self::NULLABLE],
            'order_by' => [
                self::NULLABLE,
                self::ARRAY,
            ],
            'order_by.*' => [Rule::in(['id', 'username', 'email', 'created_at', '-id', '-username', '-email', '-created_at'])],
        ]);
    }
}
