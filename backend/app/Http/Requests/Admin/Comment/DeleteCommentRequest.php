<?php

namespace App\Http\Requests\Admin\Comment;

use App\Http\Requests\Admin\BaseAdminRequest;
use Illuminate\Validation\Rule;

/**
 * Delete a comment
 * Used by: POST /admin/comments/{id}/delete
 */
class DeleteCommentRequest extends BaseAdminRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'comment_id' => $this->route('comment_id'),
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
            'comment_id' => [
                'required',
                'integer',
                Rule::exists('posts', 'id'), // Comments are stored in posts table with type='comment'
            ],
            'reason' => 'required|string|min:10|max:500',
        ]);
    }
}
