<?php

namespace App\Http\Requests\Post;

use App\Http\Requests\BaseListRequest;

class GetFollowingPostsRequest extends BaseListRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
    }

    /**
     * set rules
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'q' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'cursor' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'per_page' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
        ]);
    }
}
