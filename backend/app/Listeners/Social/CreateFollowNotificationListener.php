<?php

namespace App\Listeners\Social;

use App\Events\Social\UserFollowedEvent;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;

class CreateFollowNotificationListener implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly NotificationService $notificationService)
    {
        $this->onQueue('notifications');
        $this->afterCommit = true;
    }

    public function handle(UserFollowedEvent $event): void
    {
        $this->notificationService->notifyFollow(
            actorId: $event->actorId,
            notifiableId: $event->targetUserId,
        );
    }
}
