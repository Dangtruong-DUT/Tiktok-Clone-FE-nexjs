<?php

namespace App\Models;

use App\Enums\Ai\ScheduledPostSourceEnum;
use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScheduledPost extends Model
{
    use HasUuidObservable;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'post_id',
        'scheduled_at',
        'user_timezone',
        'status',
        'source',
        'calendar_item_id',
        'published_at',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'status'       => ScheduledPostStatusEnum::class,
            'source'       => ScheduledPostSourceEnum::class,
            'scheduled_at' => 'datetime',
            'published_at' => 'datetime',
            'created_at'   => 'datetime',
            'updated_at'   => 'datetime',
            'deleted_at'   => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function calendarItem(): BelongsTo
    {
        return $this->belongsTo(AiContentCalendarItem::class, 'calendar_item_id');
    }
}
