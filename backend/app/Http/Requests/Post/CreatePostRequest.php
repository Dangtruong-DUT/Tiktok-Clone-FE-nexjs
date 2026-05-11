<?php

namespace App\Http\Requests\Post;

use App\Enums\Media\MediaTypeEnum;
use App\Enums\Post\AudienceTypeEnum;
use App\Enums\Post\PostTypeEnum;
use App\Http\Requests\BaseRequest;
use App\Rules\PostId;
use App\Rules\UploadFileId;
use App\Rules\UserId;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class CreatePostRequest extends BaseRequest
{
    /**
     * set rules
 */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'parent_id' => [
                self::SOMETIMES,
                self::REQUIRED,
                self::INTEGER,
                new PostId,
            ],
            'type' => [
                self::REQUIRED,
                new Enum(PostTypeEnum::class),
            ],
            'audience' => [
                self::REQUIRED,
                new Enum(AudienceTypeEnum::class),
            ],
            'content' => [
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
                self::INTEGER,
                new UploadFileId,
            ],
            'medias' => [
                Rule::requiredIf(fn () => in_array($this->type, [
                    PostTypeEnum::POST->value,
                    PostTypeEnum::RE_POST->value,
                    PostTypeEnum::QUOTE_POST->value,
                ])),
                Rule::when(
                    fn () => in_array($this->type, [
                        PostTypeEnum::POST->value,
                        PostTypeEnum::RE_POST->value,
                        PostTypeEnum::QUOTE_POST->value,
                    ]),
                    ['array', 'min:1', 'max:10']
                ),
            ],
            'medias.*.file_id' => [
                self::INTEGER,
                new UploadFileId,
            ],
            'medias.*.type' => [
                self::REQUIRED,
                new Enum(MediaTypeEnum::class),
            ],
        ]);
    }
}
