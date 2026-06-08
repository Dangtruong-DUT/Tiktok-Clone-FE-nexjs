<?php

namespace App\Jobs\AI;

use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Models\ScheduledPost;
use App\Services\Post\PostScheduleService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PublishScheduledPostJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 2;
    public int $timeout = 60;

    public function __construct(
        private readonly int $scheduledPostId,
    ) {
        $this->onQueue('default');
    }

    public function handle(PostScheduleService $service): void
    {
        /** @var ScheduledPost|null */
        $scheduledPost = ScheduledPost::find($this->scheduledPostId);

        // Command pre-marks to PROCESSING before dispatching; job must accept that state
        if (! $scheduledPost || $scheduledPost->status !== ScheduledPostStatusEnum::PROCESSING) {
            return;
        }

        try {
            $service->executePublish($scheduledPost);
        } catch (\Throwable $e) {
            $service->markFailed($scheduledPost, $e->getMessage());
        }
    }
}
