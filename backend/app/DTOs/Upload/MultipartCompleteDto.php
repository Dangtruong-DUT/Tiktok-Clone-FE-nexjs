<?php

namespace App\DTOs\Upload;

final class MultipartCompleteDto
{
    public function __construct(
        public readonly int $partNumber,
        public readonly string $etag,
    ) {}
}
