<?php

namespace App\Events\Video;

use App\Models\VideoEncoding;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VideoEncodingStatusUpdatedEvent
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly VideoEncoding $videoEncoding,
    ) {}
}
