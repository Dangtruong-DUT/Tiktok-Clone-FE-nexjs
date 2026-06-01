<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiStudioSetting extends Model
{
    protected $fillable = [
        'daily_limit_per_user',
        'global_daily_limit',
        'rate_limit_per_minute',
        'is_enabled',
        'require_min_input',
        'gemini_model',
        'max_output_tokens',
        'temperature',
        'timeout_seconds',
        'cache_ttl_hours',
        'async_mode',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled'        => 'boolean',
            'require_min_input' => 'boolean',
            'async_mode'        => 'boolean',
            'temperature'       => 'float',
        ];
    }

    /**
     * Get or create the singleton settings record.
     */
    public static function current(): self
    {
        return self::firstOrCreate(['id' => 1], [
            'daily_limit_per_user'  => 20,
            'global_daily_limit'    => 5000,
            'rate_limit_per_minute' => 10,
            'is_enabled'            => true,
            'require_min_input'     => true,
            'gemini_model'          => 'gemini-1.5-flash',
            'max_output_tokens'     => 2048,
            'temperature'           => 0.70,
            'timeout_seconds'       => 30,
            'cache_ttl_hours'       => 6,
            'async_mode'            => true,
        ]);
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
