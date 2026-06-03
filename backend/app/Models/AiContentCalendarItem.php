<?php

namespace App\Models;

use App\Enums\Ai\CalendarItemStatusEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiContentCalendarItem extends Model
{
    use HasUuidObservable;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'calendar_id',
        'user_id',
        'day_of_week',
        'content_idea',
        'suggested_format',
        'suggested_hashtags',
        'caption_draft',
        'hook_idea',
        'estimated_virality_score',
        'status',
        'draft_post_id',
    ];

    protected function casts(): array
    {
        return [
            'suggested_hashtags'       => 'array',
            'estimated_virality_score' => 'float',
            'day_of_week'              => 'integer',
            'status'                   => CalendarItemStatusEnum::class,
            'created_at'               => 'datetime',
            'updated_at'               => 'datetime',
            'deleted_at'               => 'datetime',
        ];
    }

    public function calendar(): BelongsTo
    {
        return $this->belongsTo(AiContentCalendar::class, 'calendar_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function draftPost(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'draft_post_id');
    }

    public function scheduledPost(): HasOne
    {
        return $this->hasOne(ScheduledPost::class, 'calendar_item_id');
    }
}
