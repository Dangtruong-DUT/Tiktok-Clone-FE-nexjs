<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum AiCopilotMessageRoleEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case USER      = 'user';
    case ASSISTANT = 'assistant';
    case SYSTEM    = 'system';

    /**
     * Get the label of the enum value.
     */
    public function label(): string
    {
        return match ($this) {
            self::USER      => 'User',
            self::ASSISTANT => 'Assistant',
            self::SYSTEM    => 'System',
        };
    }

    /**
     * Get the translated label of the enum value.
     */
    public function translate(): string
    {
        return match ($this) {
            self::USER      => 'Nguoi dung',
            self::ASSISTANT => 'Tro ly AI',
            self::SYSTEM    => 'He thong',
        };
    }
}
