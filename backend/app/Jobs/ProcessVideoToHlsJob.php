<?php

namespace App\Jobs;

use App\Enums\Video\VideoEncodingStatusEnum;
use App\Models\VideoEncoding;
use App\Services\Video\VideoProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessVideoToHlsJob implements ShouldQueue, ShouldBeUniqueUntilProcessing
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 7200;

    public array $backoff = [60, 300, 900];

    public function __construct(
        private readonly VideoEncoding $videoEncoding,
    ) {
        $this->onQueue('video-processing');
    }

    public function handle(VideoProcessingService $service): void
    {
        if (! $this->videoEncoding->exists()) {
            return;
        }

        $service->process($this->videoEncoding);
    }

    /**
     * Called after all
     * retries are exhausted.
     **/
    public function failed(\Throwable $e): void
    {
        Log::error('ProcessVideoToHlsJob permanently failed', [
            'video_encoding_id' => $this->videoEncoding->id,
            'error' => $e->getMessage(),
        ]);

        $this->videoEncoding->update([
            'status' => VideoEncodingStatusEnum::FAILED,
            'error_message' => 'Exhausted all retries: '.$e->getMessage(),
            'completed_at' => now(),
        ]);
    }

    /** Prevent enqueueing
     * the same video encoding more than once at a time.
     **/
    public function uniqueId(): string
    {
        return 'video-encoding-'.$this->videoEncoding->id;
    }
}
