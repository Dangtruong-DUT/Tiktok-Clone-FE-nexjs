<?php

namespace App\Listeners\Social;

use App\Events\Social\UserMentionedEvent;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;

class CreateMentionNotificationsListener implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly NotificationService $notificationService)
    {
        $this->onQueue('notifications');
        $this->afterCommit = true;
    }

    public function handle(UserMentionedEvent $event): void
    {
        $this->notificationService->notifyMention(
            actorId: $event->actorId,
            post: $event->post,
            mentionedUserIds: $event->mentionedUserIds,
        );
    }
}
