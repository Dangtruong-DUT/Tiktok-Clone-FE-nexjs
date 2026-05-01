<?php

namespace App\Models;

use App\Enums\Appeal\AppealStatusEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
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
            'evidence_file_ids' => 'array',
        ];
    }

    /**
     * Get the user who filed the appeal.
     *
     * @return BelongsTo<User, self>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the admin who reviewed the appeal.
     *  
     * @return BelongsTo<User, self>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /*
     * Get the evidence files attached to this appeal.
     * Uses evidence_file_ids JSON array to look up UploadFile records.
     *
     * @return Attribute<Collection<int, UploadFile>>
     */
    public function evidenceFiles(): Attribute
    {
        return Attribute::make(
            get: fn () => UploadFile::query()
                ->whereIn('id', $this->evidence_file_ids ?? [])
                ->get()
        );
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
}
