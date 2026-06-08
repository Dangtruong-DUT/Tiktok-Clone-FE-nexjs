<?php

namespace App\Models;

use App\Enums\Admin\ActivityTypeEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Traits\HasUuidObservable;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ActivityLog - Track system-wide events and user activities
 * Comprehensive audit trail for all significant events in the system
 */
class ActivityLog extends Model
{
    use HasUuidObservable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'activity_logs';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'activity_type',
        'resource_type',
        'resource_id',
        'metadata',
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
            'activity_type' => ActivityTypeEnum::class,
            'metadata' => 'json',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the user associated with the activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope: Filter logs by user ID
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    #[Scope]
    public function byUser(Builder $query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Filter logs by activity type
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    #[Scope]
    public function byActivityType(Builder $query, string $activityType)
    {
        return $query->where('activity_type', $activityType);
    }

    /**
     * Scope: Filter logs by resource type
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    #[Scope]
    public function byResourceType(Builder $query, ResourceTypeEnum $resourceType)
    {
        return $query->where('resource_type', $resourceType->value);
    }

    /**
     * Scope: Filter logs by date range
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    #[Scope]
    public function dateRange(Builder $query, Carbon $from, Carbon $to)
    {
        return $query->whereBetween('created_at', [$from, $to]);
    }

    /**
     * Scope: Filter logs for last N days
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    #[Scope]
    public function lastDays(Builder $query, int $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
