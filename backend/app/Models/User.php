<?php

namespace App\Models;

use App\Enums\Auth\TokenTypeEnum;
use App\Enums\User\RelationshipTypeEnum;
use App\Enums\User\RoleTypeEnum;
use App\Enums\User\UserVerifyStatusEnum;
use App\Traits\HasCreateDefaultUserSettingObservable;
use App\Traits\HasUsernameObservable;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Contracts\JWTSubject;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 */
class User extends Authenticatable implements JWTSubject
{
    use HasCreateDefaultUserSettingObservable;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use HasUsernameObservable;
    use HasUuidObservable;
    use Notifiable;
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
 */
    protected $fillable = [
        'uuid',
        'name',
        'username',
        'email',
        'password',
        'bio',
        'location',
        'website',
        'date_of_birth',
        'verify',
        'avatar_file_id',
        'banned_at',
        'ban_reason',
        'ban_duration_days',
    ];

    /**
     * The default attributes for the model.
     *
     * @var array<string, mixed>
 */
    protected $attributes = [
        'verify' => UserVerifyStatusEnum::UNVERIFIED->value,
        'role' => RoleTypeEnum::USER->value,
        'following_count' => 0,
        'followers_count' => 0,
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
 */
    protected $hidden = [
        'password',
        'deleted_at',
    ];

    /**
     * The accessors to append to model's array form.
     *
     * @var list<string>
 */
    protected $appends = [
        'avatar_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
 */
    protected function casts(): array
    {
        return [
            'verify' => UserVerifyStatusEnum::class,
            'role' => RoleTypeEnum::class,
            'following_count' => 'integer',
            'followers_count' => 'integer',
            'likes_count' => 'integer',
            'is_followed' => 'boolean',
            'is_owner' => 'boolean',
            'banned_at' => 'datetime',
            'ban_reason' => 'string',
            'ban_duration_days' => 'integer',
            'date_of_birth' => 'date',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
 */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @param  int  $tokenType  The type of the token (access or refresh).
     * @return array
 */
    public function getJWTCustomClaims(
        int $tokenType = TokenTypeEnum::ACCESS->value
    ) {
        return [
            'user_id' => $this->id,
            'uuid' => $this->uuid,
            'verify' => $this->verify->value,
            'role' => $this->role->value,
            'token_type' => $tokenType,
            'jti' => Str::uuid(),
            'banned' => $this->isBanned(),
            'ban_remaining_days' => $this->getBanRemainingDays(),
            'ban_until' => $this->getBanUntilIso(),
            'ban_reason' => $this->ban_reason,
        ];
    }

    /**
     * Get the refresh tokens associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany The relationship instance.
 */
    public function refreshTokens(): HasMany
    {
        return $this->hasMany(RefreshToken::class);
    }

    /**
     * Get the forgot password tokens associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany The relationship instance.
 */
    public function forgotPasswordTokens(): HasMany
    {
        return $this->hasMany(ForgotPasswordToken::class);
    }

    /**
     * Get the email verification tokens associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany The relationship instance.
 */
    public function emailVerifyTokens(): HasMany
    {
        return $this->hasMany(EmailVerifyToken::class);
    }

    public function password(): Attribute
    {
        return Attribute::make(
            set: fn ($value) => Hash::make($value),
            get: fn ($value) => $value
        );
    }

    /**
     * Get the avatar file associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
 */
    public function avatarFile(): BelongsTo
    {
        return $this->belongsTo(UploadFile::class, 'avatar_file_id');
    }

    /**
     * Get the URL of the user's avatar.
     *
     * @return string|null The URL of the user's avatar, or null if not set.
 */
    public function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->avatarFile?->url
        );
    }

    /**
     * Check if the user is verified.
     *
     * @return bool True if the user is verified, false otherwise.
 */
    public function isVerified(): bool
    {
        return $this->verify === UserVerifyStatusEnum::VERIFIED;
    }

    /**
     * Check if the user is banned.
     *
     * @return bool True if the user is banned, false otherwise.
 */
    public function isBanned(): bool
    {
        if (! $this->banned_at) {
            return false;
        }
        // If ban_duration_days is null, it means the ban is permanent
        if ($this->ban_duration_days === null) {
            return true;
        }

        return now()->lessThan($this->banned_at->copy()->addDays($this->ban_duration_days));
    }

    /**
     * Get the remaining days of the user's ban.
     *
     * @return int|null The number of remaining days of the user's ban, or null if the user is not banned or the ban is permanent.
 */
    public function getBanRemainingDays(): ?int
    {
        if (! $this->banned_at || $this->ban_duration_days === null) {
            return null;
        }
        $banEndDate = $this->banned_at->copy()->addDays($this->ban_duration_days);
        $remainingDays = now()->diffInDays($banEndDate, false);

        return $remainingDays > 0 ? $remainingDays : 0;
    }

    /**
     * Get the ISO-8601 timestamp when the ban ends.
     *
     * @return string|null The ban end timestamp, or null if not banned or permanent.
 */
    public function getBanUntilIso(): ?string
    {
        if (! $this->banned_at || $this->ban_duration_days === null) {
            return null;
        }

        return $this->banned_at
            ->copy()
            ->addDays($this->ban_duration_days)
            ->toIso8601String();
    }

    /**
     * Check if the given password matches the user's current password.
     *
     * @param  string  $password  The password to check.
     * @return bool True if the given password matches the user's current password, false otherwise.
 */
    public function isCurrentPassword(string $password): bool
    {
        return Hash::check($password, $this->password);
    }

    /**
     * Get the posts created by the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany The relationship instance.
 */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get the users that follow the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany The relationship instance.
 */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'relationships',
            'target_user_id',
            'user_id'
        )
            ->wherePivot('type', RelationshipTypeEnum::FOLLOW);
    }

    /**
     * Check if the user is followed by another user.
     *
     * @param  User  $user  The user to check.
     * @return bool True if the user is followed by the given user, false otherwise.
 */
    public function isFollowedBy(User $user): bool
    {
        return $this->followers()->whereKey($user->id)->exists();
    }

    /**
     * Check if the user is following another user.
     *
     * @param  User  $user  The user to check.
     * @return bool True if the user is following the given user, false otherwise.
 */
    public function isFollowed(User $user): bool
    {
        return $this->followings()->whereKey($user->id)->exists();
    }

    /**
     * Get the users that the user follows.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany The relationship instance.
 */
    public function followings(): belongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'relationships',
            'user_id',
            'target_user_id'
        )->wherePivot('type', RelationshipTypeEnum::FOLLOW);
    }

    /**
     * Get the posts that the user is mentioned in.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany The relationship instance.
 */
    public function postMentions(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_mentions', 'user_id', 'post_id');
    }

    /**
     * Get the posts that the user has liked.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany The relationship instance.
 */
    public function likedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_likes', 'user_id', 'post_id');
    }

    /**
     * Get the posts that the user has bookmarked.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany The relationship instance.
 */
    public function bookmarkedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_bookmarks', 'user_id', 'post_id');
    }

    /**
     * Get the user settings associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne The relationship instance.
 */
    public function settings(): HasOne
    {
        return $this->hasOne(UserSettings::class);
    }

    /**
     * Get the notifications associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany The relationship instance.
 */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'notifiable_id');
    }

    /**
     * Scope a query to only include admin users.
     *
     * @param \Illuminate\Database\Eloquent\Builder .
     * @return \Illuminate\Database\Eloquent\Builder.
 */
    #[Scope]
    public function admin(Builder $query): Builder
    {
        return $query->where('role', RoleTypeEnum::SUPER_ADMIN->value);
    }

    /**
     * Check if the user is a super admin.
     *
     * @return bool True if the user is a super admin, false otherwise.
 */
    public function isSuperAdmin(): bool
    {
        return $this->role === RoleTypeEnum::SUPER_ADMIN;
    }
}
