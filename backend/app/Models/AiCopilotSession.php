<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiCopilotSession extends Model
{
    protected $fillable = [
        'uuid',
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
}
