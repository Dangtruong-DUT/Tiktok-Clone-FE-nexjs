<?php

namespace App\Enums\Conversation;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum ConversationTypeEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case PRIVATE = 1;
    case GROUP = 2;

    public function label(): string
    {
        return match ($this) {
            self::PRIVATE => 'Private',
            self::GROUP => 'Group',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::PRIVATE => 'private',
            self::GROUP => 'group',
        };
    }
}
