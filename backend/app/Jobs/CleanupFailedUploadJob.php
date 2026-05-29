<?php

namespace App\Jobs;

use App\Actions\Video\AbortUploadSessionAction;
use App\Models\VideoUploadSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CleanupFailedUploadJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** @var int Retry up to 3 times before giving up. */
    public int $tries = 3;

    /** @var int Maximum execution time in seconds. */
    public int $timeout = 120;

    /**
     * @param  int  $sessionId  Primary key of the VideoUploadSession to clean up.
     */
    public function __construct(private readonly int $sessionId)
    {
        $this->onQueue('default');
    }

    /**
     * Abort the upload session, cleaning up S3 objects and encoding records.
     * Skips silently if the session has already been soft-deleted.
     *
     * @param  AbortUploadSessionAction  $abortAction
     * @throws \Throwable  Re-throws on failure so the job is retried.
     */
    public function handle(AbortUploadSessionAction $abortAction): void
    {
        $session = VideoUploadSession::withTrashed()->find($this->sessionId);

        if (! $session || $session->trashed()) {
            return;
        }

        try {
            $abortAction->execute($session);
        } catch (\Throwable $e) {
            Log::error('CleanupFailedUploadJob failed', [
                'session_id' => $this->sessionId,
                'error'      => $e->getMessage(),
            ]);

            throw $e;
        }
    }
}
