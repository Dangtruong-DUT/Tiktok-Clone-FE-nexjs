<?php

namespace App\Http\Requests\Conversation;

use App\Enums\Conversation\MessageTypeEnum;
use App\Enums\Media\MediaTypeEnum;
use App\Http\Requests\BaseRequest;
use App\Rules\ConversationId;
use App\Rules\MessageId;
use App\Rules\UploadFileId;
use Illuminate\Validation\Rules\Enum;

class SendMessageRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'conversation_id' => $this->route('conversation_id'),
        ]);
    }

    public function rules(): array
    {
        return $this->applyBaseRules([
            'conversation_id' => [
                self::REQUIRED,
                self::INTEGER,
                new ConversationId(),
            ],
            'content' => [
                self::REQUIRED,
                self::STRING,
                self::MIN . ':1',
                self::MAX . ':4000',
            ],
            'type' => [
                self::REQUIRED,
                new Enum(MessageTypeEnum::class),
            ],
            'reply_to_id' => [
                self::SOMETIMES,
                self::NULLABLE,
                self::INTEGER,
                new MessageId(),
            ],
            'medias' => [
                self::SOMETIMES,
                self::ARRAY,
                self::MAX . ':10',
            ],
            'medias.*.file_id' => [
                self::REQUIRED,
                self::INTEGER,
                new UploadFileId(),
            ],
            'medias.*.type' => [
                self::REQUIRED,
                new Enum(MediaTypeEnum::class),
            ],
            'medias.*.order' => [
                self::SOMETIMES,
                self::INTEGER,
                self::MIN . ':0',
            ],
        ]);
    }
}
