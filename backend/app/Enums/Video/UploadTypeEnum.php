<?php

namespace App\Enums\Video;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum UploadTypeEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case SINGLE     = 'single';
    case MULTIPART  = 'multipart';

    /**
     * Get the human-readable label for the upload type.
     */
    public function label(): string
    {
        return match ($this) {
            self::SINGLE    => 'Single Upload',
            self::MULTIPART => 'Multipart Upload',
        };
    }

    /**
     * Get the translated label for the upload type.
     */
    public function translate(): string
    {
        return match ($this) {
            self::SINGLE    => 'Upload đơn',
            self::MULTIPART => 'Upload nhiều phần',
        };
    }

    /**
     * Determine whether this upload type requires multipart completion.
     */
    public function isMultipart(): bool
    {
        return $this === self::MULTIPART;
    }
}
