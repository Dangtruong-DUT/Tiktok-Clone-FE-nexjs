<?php

namespace App\Http\Requests\Post;

use App\Enums\Post\AudienceTypeEnum;
use App\Http\Requests\BaseRequest;
use App\Rules\UploadFileId;
use App\Rules\UserId;
use Illuminate\Validation\Rules\Enum;

class UpdatePostRequest extends BaseRequest
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
            'audience' => [
                self::SOMETIMES,
                self::REQUIRED,
                new Enum(AudienceTypeEnum::class),
            ],
            'content' => [
                self::SOMETIMES,
                self::REQUIRED,
                self::STRING,
                self::MIN.':0',
                self::MAX.':4000',
            ],
            'mentions' => [
                self::SOMETIMES,
                self::ARRAY,
                self::MIN.':0',
                self::MAX.':50',
            ],
            'mentions.*' => [
                self::INTEGER,
                new UserId,
            ],
            'hashtags' => [
                self::SOMETIMES,
                self::ARRAY,
            ],
            'hashtags.*' => [
                self::STRING,
                self::MAX.':255',
            ],
            'thumbnail' => [
                self::SOMETIMES,
                self::NULLABLE,
                self::INTEGER,
                new UploadFileId,
            ],
        ]);
    }
}
