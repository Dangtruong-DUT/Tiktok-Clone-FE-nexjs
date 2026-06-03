<?php

namespace App\Models;

use App\Enums\Ai\AiContentSuggestionStatusEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiContentCalendar extends Model
{
    use HasUuidObservable;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'niche',
        'content_style',
        'posting_frequency',
        'primary_goals',
        'target_audience',
        'creator_language',
        'weekly_themes',
        'strategy_notes',
        'status',
        'provider',
        'model',
        'prompt_version',
        'token_usage',
        'error_message',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'primary_goals'  => 'array',
            'weekly_themes'  => 'array',
            'token_usage'    => 'array',
            'status'         => AiContentSuggestionStatusEnum::class,
            'generated_at'   => 'datetime',
            'created_at'     => 'datetime',
            'updated_at'     => 'datetime',
            'deleted_at'     => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(AiContentCalendarItem::class, 'calendar_id')
            ->orderBy('day_of_week');
    }
}