<?php

namespace App\Models;

use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScreenTimeSession extends Model
{
    use HasUuidObservable;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'started_at',
        'ended_at',
        'duration_seconds',
        'video_seconds',
        'last_heartbeat_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at'        => 'datetime',
            'ended_at'          => 'datetime',
            'last_heartbeat_at' => 'datetime',
            'duration_seconds'  => 'integer',
            'video_seconds'     => 'integer',
            'created_at'        => 'datetime',
            'updated_at'        => 'datetime',
            'deleted_at'        => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
