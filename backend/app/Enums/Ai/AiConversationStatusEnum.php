<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum AiConversationStatusEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case WAITING_FOR_ANSWER = 'waiting_for_answer';
    case GENERATING         = 'generating';
    case COMPLETED          = 'completed';
    case FAILED             = 'failed';

    public function label(): string
    {
        return match ($this) {
            self::WAITING_FOR_ANSWER => 'Waiting for answer',
            self::GENERATING         => 'Generating',
            self::COMPLETED          => 'Completed',
            self::FAILED             => 'Failed',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::WAITING_FOR_ANSWER => 'Chờ trả lời',
            self::GENERATING         => 'Đang tạo',
            self::COMPLETED          => 'Hoàn thành',
            self::FAILED             => 'Thất bại',
        };
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::COMPLETED, self::FAILED], true);
    }
}
