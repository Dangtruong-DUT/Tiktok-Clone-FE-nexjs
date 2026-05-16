<?php

namespace App\Listeners\Admin;

use App\Events\Admin\AdminActionLoggedEvent;
use App\Services\Admin\AdminLogService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;

class CreateAdminLogListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;
    public array $backoff = [30, 60, 120, 300, 600];

    public function __construct(private readonly AdminLogService $adminLogService)
    {
        $this->onQueue('audit');
        $this->afterCommit = true;
    }

    public function handle(AdminActionLoggedEvent $event): void
    {
        $this->adminLogService->log(
            admin: $event->admin,
            resourceType: $event->resourceType,
            resourceId: $event->resourceId,
            action: $event->action,
            reason: $event->reason,
            oldData: $event->oldData,
            newData: $event->newData,
        );
    }

    public function failed(AdminActionLoggedEvent $event, \Throwable $exception): void
    {
        Log::critical('Failed to create admin audit log — audit trail may be incomplete', [
            'admin_id' => $event->admin->id,
            'action' => $event->action->value,
            'resource_type' => $event->resourceType->value,
            'resource_id' => $event->resourceId,
            'error' => $exception->getMessage(),
        ]);
    }
}
