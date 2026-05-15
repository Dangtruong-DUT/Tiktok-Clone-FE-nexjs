<?php

namespace App\Models;

use App\Traits\HasHashedToken;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefreshToken extends Model
{
    use HasHashedToken;

    /*
    * Indicates if the model should be timestamped.
    *
    * @var bool
    */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'jti',
        'expires_at',
    ];

    /*
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the refresh token.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
