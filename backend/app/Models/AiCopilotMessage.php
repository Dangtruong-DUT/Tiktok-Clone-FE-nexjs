<?php

namespace App\Models;

use App\Enums\Ai\AiCopilotMessageRoleEnum;
use App\Enums\Ai\AiCopilotMessageStatusEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiCopilotMessage extends Model
{
    use HasUuidObservable;

    protected $fillable = [
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
        'uuid',
    ];

    protected function casts(): array
    {
        return [
            'role'             => AiCopilotMessageRoleEnum::class,
            'status'           => AiCopilotMessageStatusEnum::class,
            'attachments'      => 'array',
            'structured_output' => 'array',
            'follow_up_chips'  => 'array',
            'token_usage'      => 'array',
        ];
    }

    /**
     * @return BelongsTo<AiCopilotSession, self>
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(AiCopilotSession::class, 'session_id');
    }

    /**
     * @return BelongsTo<AiPromptTemplate, self>
     */
    public function promptTemplate(): BelongsTo
    {
        return $this->belongsTo(AiPromptTemplate::class, 'prompt_template_id');
    }
}
