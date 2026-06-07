<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiPromptTemplate extends Model
{
    protected $fillable = [
        'intent',
        'category',
        'display_name',
        'system_prompt',
        'user_template',
        'few_shot_examples',
        'output_schema',
        'is_active',
        'is_locked',
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
            'is_locked'         => 'boolean',
        ];
    }

    public static function forIntent(string $intent): ?self
    {
        return self::where('intent', $intent)->where('is_active', true)->first();
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
