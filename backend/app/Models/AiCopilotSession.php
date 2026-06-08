<?php

namespace App\Models;

use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\MassPrunable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiCopilotSession extends Model
{
    use HasUuidObservable, MassPrunable;

    protected $fillable = [
        'user_id',
        'post_id',
        'upload_session_uuid',
        'video_size_bytes',
        'context_snapshot',
        'session_meta',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'context_snapshot' => 'array',
            'session_meta'     => 'array',
            'expires_at'       => 'datetime',
        ];
    }

    public function isLargeVideo(): bool
    {
        return $this->video_size_bytes !== null
            && $this->video_size_bytes > 524_288_000; // 500MB
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(AiCopilotMessage::class, 'session_id');
    }

    public function recentMessages(int $limit = 10): HasMany
    {
        return $this->messages()
            ->orderByDesc('created_at')
            ->limit($limit);
    }

    public function prunable(): Builder
    {
        // Retain expired sessions for 30 days so admin analytics can still read them.
        return static::query()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now()->subDays(30));
    }
}
