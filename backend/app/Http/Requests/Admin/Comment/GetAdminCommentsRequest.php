<?php

namespace App\Http\Requests\Admin\Comment;

use App\Http\Requests\BaseListRequest;
use Illuminate\Validation\Rule;

class GetAdminCommentsRequest extends BaseListRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'q' => [self::NULLABLE, self::STRING, self::MAX.':200'],
            'post_uuid' => [self::NULLABLE],
            'user_uuid' => [self::NULLABLE],
            'date_from' => [self::NULLABLE, self::DATE_FORMAT.':Y-m-d'],
            'date_to' => [self::NULLABLE, self::DATE_FORMAT.':Y-m-d'],
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
