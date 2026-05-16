<?php

namespace App\Listeners\Admin;

use App\Events\Admin\AdminModerationActionNotifiedEvent;
use App\Services\NotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class NotifyModerationActionListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

    public function __construct(private readonly NotificationService $notificationService)
    {
        $this->onQueue('notifications');
        $this->afterCommit = true;
    }

    public function handle(AdminModerationActionNotifiedEvent $event): void
    {
        $this->notificationService->notifyAdminModerationAction(
            adminId: $event->admin->id,
            notifiableUserId: $event->targetUser->id,
            entityType: $event->entityType,
            entityId: $event->entityId,
            data: $event->notificationData,
        );
    }

    public function failed(AdminModerationActionNotifiedEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to create moderation action notification', [
            'admin_id' => $event->admin->id,
            'target_user_id' => $event->targetUser->id,
            'action' => $event->action->value,
            'error' => $exception->getMessage(),
        ]);
    }
}
