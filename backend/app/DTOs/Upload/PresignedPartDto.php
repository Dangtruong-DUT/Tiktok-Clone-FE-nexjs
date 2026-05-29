<?php

namespace App\DTOs\Upload;

final class PresignedPartDto
{
    public function __construct(
        public readonly string $url,
        public readonly int $partNumber,
    ) {}
}
