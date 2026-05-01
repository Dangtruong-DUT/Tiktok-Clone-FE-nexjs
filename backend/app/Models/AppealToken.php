<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppealToken extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'token',
        'appeal_type',
        'resource_id',
        'resource_type',
        'expires_at',
        'used_at',
        'appeal_id',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }

    /**
     * Get the appeal created from this token, if any.
     */
    public function appeal(): BelongsTo
    {
        return $this->belongsTo(Appeal::class, 'appeal_id');
    }

    /**
     * Check if the token has expired.
     */
    public function isExpired(): bool
    {
        if (! $this->expires_at) {
            return true;
        }

        return $this->expires_at->isPast();
    }
}
