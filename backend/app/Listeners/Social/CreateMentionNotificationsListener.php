<?php

namespace App\Listeners\Social;

use App\Events\Social\UserMentionedEvent;
use App\Services\Notification\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class CreateMentionNotificationsListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

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

    public function failed(UserMentionedEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to create mention notifications', [
            'actor_id' => $event->actorId,
            'post_id' => $event->post->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
