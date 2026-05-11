<?php

namespace App\Enums\Media;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum MediaTypeEnum: int implements BaseEnumInterface
{
    use BaseEnumTrait;

    case IMAGE = 0;
    case VIDEO = 1;
    case HLS_VIDEO = 2;

    /**
     * Get the label of the enum value.
 */
    public function label(): string
    {
        return match ($this) {
            self::IMAGE => 'Image',
            self::VIDEO => 'Video',
            self::HLS_VIDEO => 'HLS Video',
        };
    }

    /**
     * Get the translated label of the enum value.
 */
    public function translate(): string
    {
        return match ($this) {
            self::IMAGE => 'Hình ảnh',
            self::VIDEO => 'Video',
            self::HLS_VIDEO => 'HLS Video',
        };
    }
}
