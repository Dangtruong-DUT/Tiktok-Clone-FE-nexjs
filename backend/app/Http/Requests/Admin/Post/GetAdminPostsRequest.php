<?php

namespace App\Http\Requests\Admin\Post;

use App\Http\Requests\BaseListRequest;
use Illuminate\Validation\Rule;

class GetAdminPostsRequest extends BaseListRequest
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
            'user_uuid' => [self::NULLABLE],
            'status' => [
                self::NULLABLE,
                Rule::in(['all', 'visible', 'deleted']),
            ],
            'date_from' => [self::NULLABLE],
            'date_to' => [self::NULLABLE],
            'page' => [self::NULLABLE],
            'per_page' => [self::NULLABLE],
            'order_by' => [
                self::NULLABLE,
                self::ARRAY,
            ],
            'order_by.*' => [Rule::in(['id', 'created_at', 'likes_count', '-id', '-created_at', '-likes_count'])],
        ]);
    }
}
