<?php

namespace App\Http\Requests\Settings;

use App\Enums\Settings\PrivacyVisibilityEnum;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateUserSettingsRequest extends BaseRequest
{
    /**
     * set rules
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'liked_videos_visibility' => [
                self::SOMETIMES,
                self::REQUIRED,
                new Enum(PrivacyVisibilityEnum::class),
            ],
            'bookmarked_videos_visibility' => [
                self::SOMETIMES,
                self::REQUIRED,
                new Enum(PrivacyVisibilityEnum::class),
            ],
            'followers_visibility' => [
                self::SOMETIMES,
                self::REQUIRED,
                new Enum(PrivacyVisibilityEnum::class),
            ],
            'following_visibility' => [
                self::SOMETIMES,
                self::REQUIRED,
                new Enum(PrivacyVisibilityEnum::class),
            ],
        ]);
    }
}
