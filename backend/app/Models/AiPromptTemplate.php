<?php

namespace App\Models;

use App\Enums\Ai\AiCopilotIntentEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiPromptTemplate extends Model
{
    protected $fillable = [
        'intent',
        'display_name',
        'system_prompt',
        'user_template',
        'few_shot_examples',
        'output_schema',
        'is_active',
        'version',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'few_shot_examples' => 'array',
            'output_schema'     => 'array',
            'is_active'         => 'boolean',
        ];
    }

    public static function forIntent(string|AiCopilotIntentEnum $intent): ?self
    {
        $value = $intent instanceof AiCopilotIntentEnum ? $intent->value : $intent;

        return self::where('intent', $value)->where('is_active', true)->first();
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
