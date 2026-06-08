<?php

namespace App\Http\Requests\Post;

use App\Enums\Post\PostTypeEnum;
use App\Http\Requests\BaseListRequest;

class GetRelatedPostsRequest extends BaseListRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $this->merge([
            'post_uuid' => $this->route('post_uuid'),
            'post_type' => $this->query('type', PostTypeEnum::POST->value),
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
            'page' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'per_page' => [
                self::SOMETIMES,
                self::REQUIRED,
            ],
            'post_type' => [
                self::SOMETIMES,
            ],
        ]);
    }
}
