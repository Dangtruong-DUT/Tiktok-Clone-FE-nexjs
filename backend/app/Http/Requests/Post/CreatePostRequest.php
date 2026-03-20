<?php
namespace App\Http\Requests\Post;

use App\Enums\Media\MediaType;
use App\Enums\Post\AudienceType;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rules\Enum;
use App\Enums\Post\PostType;
use App\Rules\PostId;
use App\Rules\UploadFileId;
use App\Rules\UserId;

class CreatePostRequest extends BaseRequest
{
    /**
     * set rules
     *
     * @return array
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
                'parent_id'=> [
                    self::SOMETIMES,
                    self::REQUIRED,
                    self::INTEGER,
                    new PostId(),
                ],
                'type' => [
                    self::REQUIRED,
                    new Enum(PostType::class),
                ],
                'audience'=> [
                    self::REQUIRED,
                    new Enum(AudienceType::class),
                ],
                'content'=> [
                    self::STRING,
                    self::MIN.':0',
                    self::MAX.':4000',
                ],
                'mentions'=> [
                    self::SOMETIMES,
                    self::ARRAY,
                    self::MIN.':0',
                    self::MAX.':50',
                ],
                'mentions.*'=> [
                    self::INTEGER,
                    new UserId(),
                ],
                'hashtags'=> [
                    self::SOMETIMES,
                    self::ARRAY,
                ],
                'hashtags.*'=> [
                    self::STRING,
                    self::MAX.':255',
                ],
                'thumbnail'=>[
                    self::INTEGER,
                    new UploadFileId(),
                ],
                'medias'=> [
                    self::ARRAY,
                    self::MIN.':1',
                    self::MAX.':10',
                ],
                'medias.*.file_id'=> [
                    self::INTEGER,
                    new UploadFileId(),
                ],
                'medias.*.type'=> [
                    self::REQUIRED,
                    new Enum(MediaType::class),
                ],
        ]);
    }
}
