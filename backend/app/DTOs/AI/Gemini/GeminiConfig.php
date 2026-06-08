<?php

namespace App\DTOs\AI\Gemini;

use App\Models\AiStudioSetting;

final class GeminiConfig
{
    public function __construct(
        public readonly string  $model,
        public readonly float   $temperature,
        public readonly int     $maxOutputTokens,
        public readonly int     $timeoutSeconds,
        public readonly ?string $responseMimeType = null,
    ) {}

    public static function fromSetting(AiStudioSetting $setting, array $overrides = []): self
    {
        return new self(
            model:            $setting->gemini_model,
            temperature:      (float) ($overrides['temperature']    ?? $setting->temperature),
            maxOutputTokens:  (int)   ($overrides['maxOutputTokens'] ?? $setting->max_output_tokens),
            timeoutSeconds:   $setting->timeout_seconds,
            responseMimeType: $overrides['responseMimeType'] ?? null,
        );
    }
}
