<?php

namespace App\Listeners\Admin;

use App\Events\Admin\AdminActionLoggedEvent;
use App\Services\Admin\AdminLogService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;

class CreateAdminLogListener implements ShouldQueue
{
    use Queueable;

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
}
