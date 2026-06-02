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
     * Get or create the singleton settings record (id = 1).
     *
     * Uses find + manual save to avoid mass-assignment on the primary key.
     */
    public static function current(): self
    {
        $setting = self::find(1);

        if ($setting) {
            return $setting;
        }

        $setting = new self();
        $setting->daily_limit_per_user  = 20;
        $setting->global_daily_limit    = 5000;
        $setting->rate_limit_per_minute = 10;
        $setting->is_enabled            = true;
        $setting->require_min_input     = true;
        $setting->gemini_model          = 'gemini-1.5-flash';
        $setting->max_output_tokens     = 2048;
        $setting->temperature           = 0.70;
        $setting->timeout_seconds       = 30;
        $setting->cache_ttl_hours       = 6;
        $setting->async_mode            = true;
        $setting->save();

        return $setting;
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
