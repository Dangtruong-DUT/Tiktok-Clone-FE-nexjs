<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Admin\AdminResourceEnum;
use App\Models\AdminLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AdminLogService
{
    /**
     * Log an admin action
     *
     * @param User $admin The admin performing the action
    * @param AdminResourceEnum $resourceType Resource type
     * @param int|string $resourceId The ID/UUID of the resource
     * @param AdminActionEnum $action The action performed
     * @param string|null $reason Why the action was taken
     * @param array|null $oldData Previous state (JSON-serializable array)
     * @param array|null $newData Current state (JSON-serializable array)
     * @return AdminLog The created log entry
     */
    public function log(
        User $admin,
        AdminResourceEnum $resourceType,
        int|string $resourceId,
        AdminActionEnum $action,
        ?string $reason = null,
        ?array $oldData = null,
        ?array $newData = null,
    ): AdminLog {
        return AdminLog::create([
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

    /**
     * Get recent admin actions (last N actions)
     *
     * @param int $limit Number of records to fetch
     * @return Collection
     */
    public function getRecentActions(int $limit = 50): Collection
    {
        return AdminLog::query()
            ->with(['admin:id,username,avatar_file_id', 'admin.avatarFile:id,url'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get actions by specific admin
     *
     * @param User $admin
     * @param int $limit
     * @return Collection
     */
    public function getAdminActions(User $admin, int $limit = 50): Collection
    {
        return AdminLog::query()
            ->byAdmin($admin->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get actions on a specific resource
     *
     * @param AdminResourceEnum $resourceType
     * @param int|string $resourceId
     * @return Collection
     */
    public function getResourceActions(AdminResourceEnum $resourceType, int|string $resourceId): Collection
    {
        return AdminLog::query()
            ->where('resource_type', $resourceType->value)
            ->where('resource_id', (string) $resourceId)
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
