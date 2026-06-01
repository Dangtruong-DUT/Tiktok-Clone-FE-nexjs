<?php

namespace App\Http\Requests\Admin\AiStudio;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class UpdateAiStudioSettingsRequest extends BaseRequest
{
    public function rules(): array
    {
        return $this->applyBaseRules([
            'daily_limit_per_user'  => [self::NULLABLE, self::INTEGER, self::MIN . ':1', self::MAX . ':1000'],
            'global_daily_limit'    => [self::NULLABLE, self::INTEGER, self::MIN . ':1', self::MAX . ':100000'],
            'rate_limit_per_minute' => [self::NULLABLE, self::INTEGER, self::MIN . ':1', self::MAX . ':60'],
            'is_enabled'            => [self::NULLABLE, self::BOOLEAN],
            'require_min_input'     => [self::NULLABLE, self::BOOLEAN],
            'gemini_model'          => [self::NULLABLE, self::STRING, Rule::in(['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'])],
            'max_output_tokens'     => [self::NULLABLE, self::INTEGER, self::MIN . ':256', self::MAX . ':8192'],
            'temperature'           => [self::NULLABLE, self::NUMERIC, self::MIN . ':0', self::MAX . ':1'],
            'timeout_seconds'       => [self::NULLABLE, self::INTEGER, self::MIN . ':10', self::MAX . ':120'],
            'cache_ttl_hours'       => [self::NULLABLE, self::INTEGER, self::MIN . ':1', self::MAX . ':168'],
            'async_mode'            => [self::NULLABLE, self::BOOLEAN],
        ]);
    }
}
