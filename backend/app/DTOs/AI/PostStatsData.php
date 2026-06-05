<?php

namespace App\DTOs\AI;

final readonly class PostStatsData
{
    public function __construct(
        public string  $uuid,
        public string  $contentSnippet,
        public string  $status,
        public int     $likesCount,
        public int     $viewsCount,
        public int     $commentsCount,
        public ?string $publishedAt,
        public ?string $scheduledAt,
    ) {}
}
