<?php

namespace App\Enums\Wellness;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum WellnessRuleTypeEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case CONTINUOUS_USAGE = 'continuous_usage';
    case DAILY_LIMIT      = 'daily_limit';
    case VIDEO_WATCH_TIME = 'video_watch_time';
    case LATE_NIGHT       = 'late_night';

    public function label(): string
    {
        return match ($this) {
            self::CONTINUOUS_USAGE => 'Continuous Usage',
            self::DAILY_LIMIT      => 'Daily Limit',
            self::VIDEO_WATCH_TIME => 'Video Watch Time',
            self::LATE_NIGHT       => 'Late Night Usage',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::CONTINUOUS_USAGE => 'Sử dụng liên tục',
            self::DAILY_LIMIT      => 'Giới hạn hàng ngày',
            self::VIDEO_WATCH_TIME => 'Thời gian xem video',
            self::LATE_NIGHT       => 'Sử dụng khuya',
        };
    }

    /** Default condition values for this rule type */
    public function defaultCondition(): array
    {
        return match ($this) {
            self::CONTINUOUS_USAGE => ['minutes' => 120],
            self::DAILY_LIMIT      => ['minutes' => 180],
            self::VIDEO_WATCH_TIME => ['minutes' => 90],
            self::LATE_NIGHT       => ['from_hour' => 22, 'to_hour' => 6],
        };
    }

    /** Default Vietnamese message for this rule type */
    public function defaultMessage(array $conditions = []): string
    {
        return match ($this) {
            self::CONTINUOUS_USAGE => sprintf(
                'Bạn đã sử dụng ứng dụng liên tục hơn %d phút. Hãy nghỉ ngơi một chút nhé!',
                (int) ($conditions['minutes'] ?? 120)
            ),
            self::DAILY_LIMIT => sprintf(
                'Bạn đã dùng ứng dụng hơn %d phút hôm nay. Hãy cân bằng thời gian online/offline.',
                (int) ($conditions['minutes'] ?? 180)
            ),
            self::VIDEO_WATCH_TIME => sprintf(
                'Bạn đã xem video liên tục hơn %d phút. Nghỉ ngơi mắt 5–10 phút nhé!',
                (int) ($conditions['minutes'] ?? 90)
            ),
            self::LATE_NIGHT => 'Đã muộn rồi. Nghỉ ngơi sớm giúp bạn khỏe hơn vào ngày mai!',
        };
    }
}
