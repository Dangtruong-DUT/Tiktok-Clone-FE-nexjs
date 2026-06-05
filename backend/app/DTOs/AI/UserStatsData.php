<?php

namespace App\DTOs\AI;

final readonly class UserStatsData
{
    public function __construct(
        public string $name,
        public string $username,
        public int    $followersCount,
        public int    $followingCount,
        public int    $postsCount,
        public string $joinedAt,
        public string $role,
    ) {}
}
