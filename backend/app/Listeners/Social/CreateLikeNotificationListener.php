<?php

namespace App\Listeners\Social;

use App\Events\Social\PostLikedEvent;
use App\Services\Notification\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class CreateLikeNotificationListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

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

    public function failed(PostLikedEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to create like notification', [
            'actor_id' => $event->actorId,
            'post_id' => $event->post->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
