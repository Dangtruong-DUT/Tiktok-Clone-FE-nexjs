<?php

namespace App\Enums\Appeal;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

/**
 * AppealStatusEnum - Status of an appeal
 */
enum AppealStatusEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case PENDING = 'pending';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending',
            self::APPROVED => 'Approved',
            self::REJECTED => 'Rejected',
        };
    }

    public function translate(): string
    {
        return match($this) {
            self::PENDING => 'Đang chờ',
            self::APPROVED => 'Đã duyệt',
            self::REJECTED => 'Đã từ chối',
        };
    }
}
