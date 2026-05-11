<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Models\AdminLog;
use App\Models\User;
use App\Repositories\AdminLogRepository;

class AdminLogService
{
    public function __construct(
        private readonly AdminLogRepository $adminLogRepository,
    ) {}

    /**
     * Log an admin action
     * @param  User  $admin  The admin performing the action
     * @param  ResourceTypeEnum  $resourceType  Resource type
     * @param  int|string  $resourceId  The ID/UUID of the resource
     * @param  AdminActionEnum  $action  The action performed
     * @param  string|null  $reason  Why the action was taken
     * @param  array|null  $oldData  Previous state (JSON-serializable array)
     * @param  array|null  $newData  Current state (JSON-serializable array)
     * @return AdminLog The created log entry
 */
    public function log(
        User $admin,
        ResourceTypeEnum $resourceType,
        int|string $resourceId,
        AdminActionEnum $action,
        ?string $reason = null,
        ?array $oldData = null,
        ?array $newData = null,
    ): AdminLog {
        return $this->adminLogRepository->create([
            'admin_id' => $admin->id,
            'resource_type' => $resourceType->value,
            'resource_id' => (string) $resourceId,
            'action' => $action->value,
            'reason' => $reason,
            'old_data' => $oldData,
            'new_data' => $newData,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
