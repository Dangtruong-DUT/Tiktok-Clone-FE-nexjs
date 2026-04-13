<?php

namespace App\Http\Requests\Admin\Post;

use App\Http\Requests\Admin\BaseAdminRequest;
use Illuminate\Validation\Rule;

/**
 * Hide a post from public view
 * Used by: POST /admin/posts/{uuid}/hide
 */
class HidePostRequest extends BaseAdminRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'post_uuid' => $this->route('post_uuid'),
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
            'post_uuid' => [
                'required',
                'string',
                Rule::exists('posts', 'uuid'),
            ],
            'reason' => 'required|string|min:10|max:500',
        ]);
    }
}
