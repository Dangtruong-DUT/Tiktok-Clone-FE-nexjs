<?php

namespace App\Models;

use App\Enums\Ai\AiCopilotMessageRoleEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiCopilotMessage extends Model
{
    protected $fillable = [
        'uuid',
        'session_id',
        'role',
        'content',
        'intent',
        'intent_confidence',
        'attachments',
        'structured_output',
        'follow_up_chips',
        'token_usage',
        'latency_ms',
        'provider',
        'model',
        'prompt_template_id',
        'status',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'role'             => AiCopilotMessageRoleEnum::class,
            'attachments'      => 'array',
            'structured_output' => 'array',
            'follow_up_chips'  => 'array',
            'token_usage'      => 'array',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AiCopilotSession::class, 'session_id');
    }

    public function promptTemplate(): BelongsTo
    {
        return $this->belongsTo(AiPromptTemplate::class, 'prompt_template_id');
    }
}
