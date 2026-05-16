<?php

namespace App\Listeners\Admin;

use App\Enums\Common\ModelEntityTypeEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Events\Admin\AdminModerationActionNotifiedEvent;
use App\Events\Admin\AdminPositiveActionNotifiedEvent;
use App\Services\Admin\AdminLogService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;

class CreateAdminLogFromNotificationListener implements ShouldQueue
{
    use Queueable;

    public function __construct(private readonly AdminLogService $adminLogService)
    {
        $this->onQueue('audit');
        $this->afterCommit = true;
    }

    public function handle(AdminModerationActionNotifiedEvent|AdminPositiveActionNotifiedEvent $event): void
    {
        $resourceType = $this->resolveResourceType($event);
        if (! $resourceType) {
            return;
        }

        $reason = $event instanceof AdminPositiveActionNotifiedEvent
            ? $event->message
            : $event->reason;

        $this->adminLogService->log(
            admin: $event->admin,
            resourceType: $resourceType,
            resourceId: $event->entityId,
            action: $event->action,
            reason: $reason,
            oldData: null,
            newData: ['notification' => $event->notificationData],
        );
    }

    private function resolveResourceType(AdminModerationActionNotifiedEvent|AdminPositiveActionNotifiedEvent $event): ?ResourceTypeEnum
    {
        $resourceValue = $event->notificationData['resource_type'] ?? null;
        if (is_string($resourceValue)) {
            $resourceType = ResourceTypeEnum::tryFrom($resourceValue);
            if ($resourceType) {
                return $resourceType;
            }
        }

        return match ($event->entityType) {
            ModelEntityTypeEnum::USER => ResourceTypeEnum::USER,
            ModelEntityTypeEnum::POST => ResourceTypeEnum::POST,
            default => null,
        };
    }
}
