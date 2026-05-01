<?php

namespace App\Models;

use App\Enums\Settings\PrivacyVisibilityEnum;
use App\Traits\HasToken;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSettings extends Model
{
    use HasToken;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'liked_videos_visibility',
        'bookmarked_videos_visibility',
        'followers_visibility',
        'following_visibility',
    ];

    /*
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
    protected function casts(): array
    {
        return [
            'liked_videos_visibility' => PrivacyVisibilityEnum::class,
            'bookmarked_videos_visibility' => PrivacyVisibilityEnum::class,
            'followers_visibility' => PrivacyVisibilityEnum::class,
            'following_visibility' => PrivacyVisibilityEnum::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * The default attributes for the model.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'liked_videos_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
        'bookmarked_videos_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
        'followers_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
        'following_visibility' => PrivacyVisibilityEnum::PUBLIC->value,
    ];

    /**
     * Get the user whose avatar is this file.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
