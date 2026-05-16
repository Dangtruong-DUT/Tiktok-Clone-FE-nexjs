<?php

namespace App\Listeners\Admin;

use App\Events\Admin\AdminModerationActionNotifiedEvent;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;

class NotifyModerationActionListener implements ShouldQueue
{
    use Queueable;

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
}
