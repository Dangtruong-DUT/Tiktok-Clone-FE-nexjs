<?php

namespace App\Http\Requests\Admin\Comment;

use App\Http\Requests\Admin\BaseAdminRequest;
use Illuminate\Validation\Rule;

/**
 * Get list of comments with filtering and pagination
 * Used by: GET /admin/comments
 */
class GetAdminCommentsRequest extends BaseAdminRequest
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
            'search' => 'nullable|string|max:200',
            'post_uuid' => 'nullable|string|exists:posts,uuid',
            'user_id' => 'nullable|integer|exists:users,id',
            'date_from' => 'nullable|date_format:Y-m-d',
            'date_to' => 'nullable|date_format:Y-m-d',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'sort_by' => [
                'nullable',
                Rule::in(['id', 'created_at', 'likes_count', '-id', '-created_at', '-likes_count']),
            ],
        ]);
    }
}
