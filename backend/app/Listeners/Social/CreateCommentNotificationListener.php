<?php

namespace App\Listeners\Social;

use App\Events\Social\PostCommentedEvent;
use App\Services\Notification\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class CreateCommentNotificationListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

    public function __construct(private readonly NotificationService $notificationService)
    {
        $this->onQueue('notifications');
        $this->afterCommit = true;
    }

    public function handle(PostCommentedEvent $event): void
    {
        $this->notificationService->notifyComment(
            actorId: $event->actorId,
            targetPost: $event->targetPost,
            commentPost: $event->commentPost,
        );
    }

    public function failed(PostCommentedEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to create comment notification', [
            'actor_id' => $event->actorId,
            'target_post_id' => $event->targetPost->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
