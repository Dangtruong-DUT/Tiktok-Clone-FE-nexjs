<?php

namespace App\Listeners\Social;

use App\Events\Social\PostCommentedEvent;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;

class CreateCommentNotificationListener implements ShouldQueue
{
    use Queueable;

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
}
