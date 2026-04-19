<?php

namespace App\Models;

use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appeal extends Model
{
    use HasUuidObservable;

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
     * Scope query to appeals of a specific user.
     */
    #[Scope]
    public function byUserId(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }
}
