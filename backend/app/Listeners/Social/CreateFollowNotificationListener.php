<?php

namespace App\Listeners\Social;

use App\Events\Social\UserFollowedEvent;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class CreateFollowNotificationListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

    public function __construct(private readonly NotificationService $notificationService)
    {
        $this->onQueue('notifications');
        $this->afterCommit = true;
    }

    public function handle(UserFollowedEvent $event): void
    {
        $this->notificationService->notifyFollow(
            actorId: $event->actorId,
            notifiableId: $event->targetUser->id,
        );
    }

    public function failed(UserFollowedEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to create follow notification', [
            'actor_id' => $event->actorId,
            'target_user_id' => $event->targetUser->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
