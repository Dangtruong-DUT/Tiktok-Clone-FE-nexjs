<?php

namespace App\Http\Requests\Post;

use App\Http\Requests\BaseRequest;

class UnBookmarkPostRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $this->merge([
            'post_uuid' => $this->route('post_uuid'),
        ]);
    }

    /**
     * set rules
 */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'post_uuid' => [
                self::REQUIRED,
            ],
        ]);
    }
}
