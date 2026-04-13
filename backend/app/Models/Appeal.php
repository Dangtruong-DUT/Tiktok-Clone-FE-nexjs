<?php

namespace App\Models;

use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Appeal extends Model
{
    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'appeal_type',
        'resource_id',
        'resource_type',
        'reason',
        'status',
        'admin_response',
        'reviewed_by',
        'reviewed_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'appeal_type' => AppealTypeEnum::class,
        'status' => AppealStatusEnum::class,
        'reviewed_at' => 'datetime',
    ];

    /**
     * Get the user who filed the appeal.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the admin who reviewed the appeal.
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Filter appeals by user.
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Filter appeals by status.
     */
    public function scopeByStatus(Builder $query, AppealStatusEnum|string $status): Builder
    {
        $statusValue = $status instanceof AppealStatusEnum ? $status->value : $status;
        return $query->where('status', $statusValue);
    }

    /**
     * Filter appeals by type.
     */
    public function scopeByType(Builder $query, AppealTypeEnum|string $type): Builder
    {
        $typeValue = $type instanceof AppealTypeEnum ? $type->value : $type;
        return $query->where('appeal_type', $typeValue);
    }

    /**
     * Filter pending appeals.
     */
    public function scopePending(Builder $query): Builder
    {
        return $query->byStatus(AppealStatusEnum::PENDING);
    }

    /**
     * Filter recent appeals (last 30 days).
     */
    public function scopeRecent(Builder $query): Builder
    {
        return $query->where('created_at', '>=', now()->subDays(30));
    }
}
