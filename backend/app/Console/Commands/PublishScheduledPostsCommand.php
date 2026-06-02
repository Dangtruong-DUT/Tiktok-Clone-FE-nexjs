<?php

namespace App\Console\Commands;

use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Jobs\AI\PublishScheduledPostJob;
use App\Repositories\ScheduledPostRepository;
use Illuminate\Console\Command;

class PublishScheduledPostsCommand extends Command
{
    protected $signature   = 'posts:publish-scheduled';
    protected $description = 'Dispatch publish jobs for all pending scheduled posts that are due.';

    public function handle(ScheduledPostRepository $repository): int
    {
        $due = $repository->getDueForPublishing();

        if ($due->isEmpty()) {
            return self::SUCCESS;
        }

        foreach ($due as $scheduledPost) {
            // Mark as processing immediately to prevent double-dispatch
            $repository->update($scheduledPost->id, [
                'status' => ScheduledPostStatusEnum::PROCESSING,
            ]);

            PublishScheduledPostJob::dispatch($scheduledPost->id);
        }

        $this->info("Dispatched {$due->count()} publish job(s).");

        return self::SUCCESS;
    }
}
