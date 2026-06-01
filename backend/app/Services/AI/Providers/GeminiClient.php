<?php

namespace App\Services\AI\Providers;

use App\Models\AiStudioSetting;
use Illuminate\Support\Facades\Http;

class GeminiClient
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey  = (string) config('ai.gemini.api_key');
        $this->baseUrl = (string) config('ai.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta');
    }

    /**
     * Send a generate-content request to Gemini API.
     *
     * Reads model/temperature/timeout from AiStudioSetting so admin can tune without deploy.
     *
     * @return array{text: string, token_usage: array<string,int>}
     * @throws \RuntimeException on HTTP error or empty response
     */
    public function generate(string $systemPrompt, string $userPrompt): array
    {
        $settings = AiStudioSetting::current();

        $model       = $settings->gemini_model ?: (string) config('ai.gemini.model', 'gemini-1.5-flash');
        $temperature = (float) $settings->temperature;
        $maxTokens   = (int) $settings->max_output_tokens;
        $timeout     = (int) $settings->timeout_seconds;

        $url = "{$this->baseUrl}/models/{$model}:generateContent?key={$this->apiKey}";

        $payload = [
            'system_instruction' => [
                'parts' => [['text' => $systemPrompt]],
            ],
            'contents' => [
                ['role' => 'user', 'parts' => [['text' => $userPrompt]]],
            ],
            'generationConfig' => [
                'temperature'      => $temperature,
                'maxOutputTokens'  => $maxTokens,
                'responseMimeType' => 'application/json',
            ],
        ];

        $response = Http::timeout($timeout)->post($url, $payload);

        if (! $response->successful()) {
            throw new \RuntimeException(
                "Gemini API error {$response->status()}: " . mb_substr($response->body(), 0, 300)
            );
        }

        $data = $response->json();
        $text = (string) data_get($data, 'candidates.0.content.parts.0.text', '');

        if ($text === '') {
            throw new \RuntimeException('Gemini returned an empty response body.');
        }

        return [
            'text'        => $text,
            'token_usage' => [
                'prompt_tokens'     => (int) data_get($data, 'usageMetadata.promptTokenCount', 0),
                'completion_tokens' => (int) data_get($data, 'usageMetadata.candidatesTokenCount', 0),
                'total_tokens'      => (int) data_get($data, 'usageMetadata.totalTokenCount', 0),
            ],
        ];
    }
}
