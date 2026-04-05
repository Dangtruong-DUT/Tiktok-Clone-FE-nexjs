<?php

namespace App\Enums\Conversation;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum MessageTypeEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case TEXT = 1;
    case IMAGE = 2;
    case VIDEO = 3;
    case SYSTEM = 4;

    public function label(): string
    {
        return match ($this) {
            self::TEXT => 'Text',
            self::IMAGE => 'Image',
            self::VIDEO => 'Video',
            self::SYSTEM => 'System',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::TEXT => 'text',
            self::IMAGE => 'image',
            self::VIDEO => 'video',
            self::SYSTEM => 'system',
        };
    }
}
