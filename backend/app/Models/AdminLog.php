<?php

namespace App\Models;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ResourceTypeEnum;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * AdminLog - Track all administrative actions performed
 * Stores complete audit trail for compliance and monitoring
 *
 * @property int $id
 * @property int $admin_id FK to users
 * @property string $resource_type ('user', 'post', 'comment')
 * @property string $resource_id (User ID, Post UUID, Comment ID)
 * @property string $action (ban, unban, delete, hide, etc)
 * @property string|null $reason Why the action was taken
 * @property array|null $old_data Previous state (JSON)
 * @property array|null $new_data Current state (JSON)
 * @property string|null $ip_address Admin's IP
 * @property string|null $user_agent Admin's browser/device
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class AdminLog extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'admin_logs';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'admin_id',
        'resource_type',
        'resource_id',
        'action',
        'reason',
        'old_data',
        'new_data',
        'ip_address',
        'user_agent',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'resource_type' => ResourceTypeEnum::class,
            'action' => AdminActionEnum::class,
            'old_data' => 'json',
            'new_data' => 'json',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the admin who performed the action
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Scope: Filter logs by admin ID
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param int $adminId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    #[Scope]
    public function byAdmin(Builder $query, int $adminId)
    {
        return $query->where('admin_id', $adminId);
    }

    /**
     * Scope: Filter logs by resource type
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param ResourceTypeEnum $resourceType
     * @return \Illuminate\Database\Eloquent\Builder
     */
    #[Scope]
    public function byResourceType(Builder $query, ResourceTypeEnum $resourceType)
    {
        return $query->where('resource_type', $resourceType->value);
    }

    /**
     * Scope: Filter logs by action
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $action
     * @return \Illuminate\Database\Eloquent\Builder
     */
    #[Scope]
    public function byAction(Builder $query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope: Filter logs by date range
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param \Carbon\Carbon $from
     * @param \Carbon\Carbon $to
     * @return \Illuminate\Database\Eloquent\Builder
     */
    #[Scope]
    public function dateRange(Builder $query, Carbon $from, Carbon $to)
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }
}
