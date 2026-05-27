<?php

namespace App\DTOs\Video;

readonly class VideoInfoDto
{
    public function __construct(
        public float $duration,
        public int $width,
        public int $height,
        public int $bitrate,
    ) {}
}
