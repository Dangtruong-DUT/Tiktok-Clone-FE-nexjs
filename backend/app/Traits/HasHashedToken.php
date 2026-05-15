<?php

namespace App\Traits;

use Carbon\Carbon;
use \Illuminate\Support\Str;

/**
 * @property Carbon|null $expires_at
 * @property string $token_hash
 */
trait HasHashedToken
{
    /**
     * Check if the token is expired.
     */
    public function isExpired(): bool
    {
        if (!$this->expires_at) {
        return false;
    }

    return $this->expires_at->isPast();
    }


    /**
     * Generate plain token.
     * @param int $length Length of the generated token, default is 64 characters.
     * @return string The generated plain token.
     */
    public static function generatePlainToken(int $length = 64): string
    {
        return Str::random($length);
    }

    /**
     * Create token fingerprint/hash.
     * @param string $token The plain token to be hashed.
     * @return string The hashed token (fingerprint).
     */
    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /**
     * Check token matches fingerprint.
     * @param string $plainToken The plain token to check.
     * @return bool True if the token matches, false otherwise.
     */
    public function matchesToken(string $plainToken): bool
    {
        return hash_equals(
            $this->token_hash,
            self::hashToken($plainToken)
        );
    }
}
