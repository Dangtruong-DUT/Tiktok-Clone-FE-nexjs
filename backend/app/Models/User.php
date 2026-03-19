<?php

namespace App\Models;

use App\Enums\User\RelationshipType;
use App\Enums\User\UserVerifyStatus;
use App\Traits\HasUsernameObservable;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Hash;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 */
class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use Notifiable;
    use SoftDeletes;
    use HasUuidObservable;
    use HasUsernameObservable;

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
        'avatar_file_id'
    ];

    /**
    * The default attributes for the model.
    *
    * @var array<string, mixed>
    */
    protected $attributes = [
    'verify' => UserVerifyStatus::UNVERIFIED->value,
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        "deleted_at",
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'verify' => UserVerifyStatus::class,
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
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [
            "uuid"=> $this->uuid,
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

    public function password():Attribute
    {
        return Attribute::make(
            set: fn($value) => Hash::make($value),
            get: fn($value) => $value
        );
    }

    /**
     * Get the avatar file associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
    public function avatarFile():BelongsTo
    {
        return $this->belongsTo(UploadFile::class, 'avatar_file_id');
    }


    /**
     * Check if the user is verified.
     *
     * @return bool True if the user is verified, false otherwise.
     */
    public function isVerified(): bool
    {
        return $this->verify === UserVerifyStatus::VERIFIED;
    }

    /**
     * Check if the user is banned.
     *
     * @return bool True if the user is banned, false otherwise.
     */
    public function isBanned(): bool
    {
        return $this->verify === UserVerifyStatus::BANNED;
    }

    public function isCurrentPassword(string $password): bool
    {
        return Hash::check($password, $this->password);
    }

    /**
     * Get the URL of the user's avatar.
     *
     * @return string|null The URL of the user's avatar, or null if not set.
     */
    public function avatar(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->avatarFile->url ?? null
        );
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
            ->wherePivot('type', RelationshipType::FOLLOW);
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
            )->wherePivot('type', RelationshipType::FOLLOW);
    }
}