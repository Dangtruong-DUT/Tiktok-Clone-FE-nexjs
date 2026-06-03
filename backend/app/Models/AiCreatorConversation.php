<?php

namespace App\Models;

use App\Enums\Ai\AiConversationStatusEnum;
use App\Enums\Ai\AiConversationStepEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AiCreatorConversation extends Model
{
    use HasUuidObservable;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'user_id',
        'initial_prompt',
        'status',
        'current_step',
        'answers',
        'last_ai_message',
        'options',
        'generated_result',
        'provider',
        'model',
        'prompt_version',
        'token_usage',
        'error_message',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'status'           => AiConversationStatusEnum::class,
            'current_step'     => AiConversationStepEnum::class,
            'answers'          => 'array',
            'options'          => 'array',
            'generated_result' => 'array',
            'token_usage'      => 'array',
            'completed_at'     => 'datetime',
            'created_at'       => 'datetime',
            'updated_at'       => 'datetime',
            'deleted_at'       => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
