<?php

namespace App\Http\Requests\Admin\Comment;

use App\Http\Requests\BaseRequest;

class DeleteCommentRequest extends BaseRequest
{
    /**
     * Prepare the data for validation.
     * Extract comment_id from route and merge into request data
 */
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'comment_uuid' => $this->route('comment_uuid'),
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
            'comment_uuid' => [
                self::REQUIRED,
            ],
            'reason' => [
                self::REQUIRED,
                self::STRING,
                self::MIN.':10',
                self::MAX.':500',
            ],
        ]);
    }
}
