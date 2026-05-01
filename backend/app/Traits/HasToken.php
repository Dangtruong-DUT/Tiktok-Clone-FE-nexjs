<?php

namespace App\Traits;
trait HasToken
{
    /**
     * Check if the token is expired.
     */
    public function isExpired(): bool
    {
        return $this?->expires_at?->isPast();
    }
}
