<?php

namespace App\Console\Commands;

use App\Services\Post\PostViewService;
use Illuminate\Console\Command;

class SyncPostViewsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'posts:sync-views';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync post views from Redis to PostgreSQL in batch and clear Redis counters';

    /**
     * Execute the console command.
     */
    public function handle(PostViewService $postViewService): int
    {
        $syncedPosts = $postViewService->syncViewsToDatabase();

        $this->info("Synced post views for {$syncedPosts} post(s).");

        return self::SUCCESS;
    }
}
