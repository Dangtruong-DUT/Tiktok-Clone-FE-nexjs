<?php

namespace App\Actions\Video;

use App\Enums\Video\VideoEncodingStatusEnum;
use App\Jobs\ProcessVideoToHlsJob;
use App\Models\VideoEncoding;

class RetryVideoEncodingAction
{
    public function execute(VideoEncoding $encoding): void
    {
        $encoding->update([
            'status' => VideoEncodingStatusEnum::PENDING,
            'encoding_progress' => 0,
            'error_message' => null,
            'started_at' => null,
            'completed_at' => null,
        ]);

        ProcessVideoToHlsJob::dispatch($encoding)->onQueue('video-processing');
    }
}
