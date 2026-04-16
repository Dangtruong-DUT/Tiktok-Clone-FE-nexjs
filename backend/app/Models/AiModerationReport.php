<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiModerationReport extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'task_id',
        'user_id',
        'resource_type',
        'resource_id',
        'resource_uuid',
        'sentence',
        'label',
        'confidence',
        'is_violation',
        'violation_reason',
        'raw_payload',
        'moderated_at',
        'appeal_deadline_at',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'confidence' => 'float',
            'is_violation' => 'boolean',
            'raw_payload' => 'array',
            'moderated_at' => 'datetime',
            'appeal_deadline_at' => 'datetime',
        ];
    }
}
