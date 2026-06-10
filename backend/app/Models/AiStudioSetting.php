<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiStudioSetting extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
    */
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
        'feature_flags',
        'copilot_enabled',
        'copilot_session_ttl_hours',
        'copilot_max_messages_per_session',
        'updated_by',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_enabled'        => 'boolean',
            'require_min_input' => 'boolean',
            'async_mode'        => 'boolean',
            'copilot_enabled'   => 'boolean',
            'temperature'       => 'float',
            'feature_flags'     => 'array',
        ];
    }

    /**
     * Check whether a feature flag is enabled in the settings.
     *
     * @param  string  $flag
     * @return bool
     */
    public function isFeatureEnabled(string $flag): bool
    {
        $flags = $this->feature_flags ?? [];

        return (bool) ($flags[$flag] ?? true);
    }

    /**
     * Get the user that last updated the settings.
     *
     * @return BelongsTo
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
