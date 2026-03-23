<?php

namespace App\Models;

use App\Traits\HasToken;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForgotPasswordToken extends Model
{
    use HasToken;
    /*
    * The table associated with the model.
    * @var string
    */
    protected $table = 'password_resets';

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
        'token',
        'expires_at',
        'token_fingerprint',
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
     * Get the user that owns the forgot password token.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
