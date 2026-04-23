<?php

namespace App\Models;

use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\UploadFile;

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
        'appeal_token',
        'appeal_token_expires_at',
        'evidence_file_ids',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'appeal_type' => AppealTypeEnum::class,
            'status' => AppealStatusEnum::class,
            'reviewed_at' => 'datetime',
            'appeal_token_expires_at' => 'datetime',
            'evidence_file_ids' => 'array',
        ];
    }

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
     * Get the evidence files attached to this appeal.
     * Uses evidence_file_ids JSON array to look up UploadFile records.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, UploadFile>
     */
    public function getEvidenceFilesAttribute(): \Illuminate\Database\Eloquent\Collection
    {
        $ids = $this->evidence_file_ids ?? [];
        if (empty($ids)) {
            return UploadFile::query()->whereRaw('1 = 0')->get();
        }
        return UploadFile::whereIn('id', $ids)->get();
    }

    /**
     * Check if the appeal token has expired.
     */
    public function isTokenExpired(): bool
    {
        if (!$this->appeal_token_expires_at) {
            return true;
        }

        return $this->appeal_token_expires_at->isPast();
    }

    /**
     * Scope query to appeals of a specific user.
     */
    #[Scope]
    public function byUserId(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope query to appeals of a specific user (alias).
     */
    #[Scope]
    public function byUser(Builder $query, int $userId): Builder
    {
        return $this->byUserId($query, $userId);
    }

    /**
     * Scope query to appeals by status.
     * @param AppealStatusEnum|string $status
     */
    #[Scope]
    public function byStatus(Builder $query, AppealStatusEnum|string $status): Builder
    {
        $value = $status instanceof AppealStatusEnum ? $status->value : (string) $status;

        return $query->where('status', $value);
    }

    /**
     * Scope query to pending appeals.
     */
    #[Scope]
    public function pending(Builder $query): Builder
    {
        return $this->byStatus($query, AppealStatusEnum::PENDING);
    }

    /**
     * Scope query to find appeal by token.
     */
    #[Scope]
    public function byToken(Builder $query, string $token): Builder
    {
        return $query->where('appeal_token', $token);
    }
}
