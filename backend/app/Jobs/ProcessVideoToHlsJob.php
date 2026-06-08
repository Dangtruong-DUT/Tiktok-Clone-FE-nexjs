<?php

namespace App\Jobs;

use App\Enums\Video\VideoEncodingStatusEnum;
use App\Enums\Video\VideoUploadStatusEnum;
use App\Models\VideoEncoding;
use App\Models\VideoUploadSession;
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

    /** @var int Maximum number of attempts before the job is marked as failed. */
    public int $tries = 3;

    /** @var int Maximum execution time in seconds (2 hours for large videos). */
    public int $timeout = 7200;

    /** @var array<int, int> Delay in seconds between retry attempts (exponential backoff). */
    public array $backoff = [60, 300, 900];

    /**
     * @param  VideoEncoding  $videoEncoding  The encoding record to process.
     * @param  int|null       $sessionId      Optional upload session ID to sync status into.
     */
    public function __construct(
        private readonly VideoEncoding $videoEncoding,
        private readonly ?int $sessionId = null,
    ) {
        $this->onQueue('video-processing');
    }

    /**
     * Execute the HLS encoding pipeline.
     *
     * @param  VideoProcessingService  $service
     */
    public function handle(VideoProcessingService $service): void
    {
        if (! $this->videoEncoding->exists()) {
            return;
        }

        $service->process($this->videoEncoding, $this->sessionId);
    }

    /**
     * Handle job failure after all retries are exhausted.
     * Marks both the encoding record and (if available) the upload session as FAILED.
     *
     * @param  \Throwable  $e
     */
    public function failed(\Throwable $e): void
    {
        Log::error('ProcessVideoToHlsJob permanently failed', [
            'video_encoding_id' => $this->videoEncoding->id,
            'error'             => $e->getMessage(),
        ]);

        $this->videoEncoding->update([
            'status'        => VideoEncodingStatusEnum::FAILED,
            'error_message' => 'Exhausted all retries: ' . $e->getMessage(),
            'completed_at'  => now(),
        ]);

        if ($this->sessionId) {
            VideoUploadSession::find($this->sessionId)?->update([
                'status'        => VideoUploadStatusEnum::FAILED,
                'error_message' => 'Encoding failed after exhausting all retries.',
            ]);
        }
    }

    /**
     * Return a unique ID to prevent enqueueing the same encoding job more than once.
     *
     * @return string
     */
    public function uniqueId(): string
    {
        return 'video-encoding-' . $this->videoEncoding->id;
    }
}
