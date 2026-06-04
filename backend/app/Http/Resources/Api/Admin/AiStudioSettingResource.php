<?php

namespace App\Http\Resources\Api\Admin;

use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class AiStudioSettingResource extends BaseJsonResource
{
    /**
     * @return array<string,mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'daily_limit_per_user'  => $this->daily_limit_per_user,
            'global_daily_limit'    => $this->global_daily_limit,
            'rate_limit_per_minute' => $this->rate_limit_per_minute,
            'is_enabled'            => $this->is_enabled,
            'require_min_input'     => $this->require_min_input,
            'gemini_model'          => $this->gemini_model,
            'max_output_tokens'     => $this->max_output_tokens,
            'temperature'           => $this->temperature,
            'timeout_seconds'       => $this->timeout_seconds,
            'cache_ttl_hours'       => $this->cache_ttl_hours,
            'async_mode'            => $this->async_mode,
            'updated_by'            => $this->updatedBy?->only(['uuid', 'name']),
            'updated_at'            => $this->updated_at?->toISOString(),
        ];
    }
}
