<?php

namespace App\Listeners\Social;

use App\Events\Social\PostLikedEvent;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;

class CreateLikeNotificationListener implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly NotificationService $notificationService)
    {
        $this->onQueue('notifications');
        $this->afterCommit = true;
    }

    public function handle(PostLikedEvent $event): void
    {
        $this->notificationService->notifyLike(
            actorId: $event->actorId,
            post: $event->post,
        );
    }
}
