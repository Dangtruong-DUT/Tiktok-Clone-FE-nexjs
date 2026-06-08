<?php

namespace App\Jobs;

use App\Actions\Video\AbortUploadSessionAction;
use App\Repositories\VideoUploadSessionRepository;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CleanupAbandonedUploadsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** @var int Only one attempt — if it fails, the next scheduled run will retry. */
    public int $tries = 1;

    /** @var int Maximum execution time in seconds. */
    public int $timeout = 600;

    public function __construct()
    {
        $this->onQueue('default');
    }

    /**
     * Find all abandoned or expired upload sessions and abort each one.
     * Individual abort failures are logged and skipped so the batch continues.
     *
     * @param  VideoUploadSessionRepository  $repository
     * @param  AbortUploadSessionAction      $abortAction
     */
    public function handle(
        VideoUploadSessionRepository $repository,
        AbortUploadSessionAction $abortAction,
    ): void {
        $sessions = $repository->findAbandonedSessions();

        Log::info('CleanupAbandonedUploadsJob started', ['count' => $sessions->count()]);

        foreach ($sessions as $session) {
            try {
                $abortAction->execute($session);
            } catch (\Throwable $e) {
                Log::warning('Failed to cleanup abandoned session', [
                    'session_uuid' => $session->uuid,
                    'error'        => $e->getMessage(),
                ]);
            }
        }

        Log::info('CleanupAbandonedUploadsJob finished', ['processed' => $sessions->count()]);
    }
}
