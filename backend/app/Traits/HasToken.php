<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Hash;

trait HasToken
{
    /**
     * Check if the token is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Auto hash token when set.
     */
    public function token(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value,
            set: fn ($value) => Hash::make($value),
        );
    }

    /**
     * Verify raw token with hashed token in DB
     */
    public function isValidToken(string $rawToken): bool
    {
        return Hash::check($rawToken, $this->token);
    }
}
