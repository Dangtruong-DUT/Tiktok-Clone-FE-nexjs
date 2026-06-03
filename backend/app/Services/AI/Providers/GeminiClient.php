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
            $status = $response->status();
            if ($status === 429) {
                throw new \App\Exceptions\GeminiQuotaExceededException(
                    'AI quota exceeded. Please wait a moment and try again.'
                );
            }
            throw new \RuntimeException(
                "Gemini API error {$status}: " . mb_substr($response->body(), 0, 300)
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

    /**
     * Multi-turn conversation request to Gemini API.
     *
     * @param  array<array{role: string, parts: array}>  $contents  Gemini-formatted conversation history
     * @param  array<string,mixed>  $config  Optional generation config overrides
     * @return array{text: string, token_usage: array<string,int>}
     * @throws \RuntimeException
     */
    public function generateWithHistory(string $systemPrompt, array $contents, array $config = []): array
    {
        $settings    = AiStudioSetting::current();
        $model       = $settings->gemini_model ?: (string) config('ai.gemini.model', 'gemini-1.5-flash');
        $timeout     = (int) $settings->timeout_seconds;

        $url = "{$this->baseUrl}/models/{$model}:generateContent?key={$this->apiKey}";

        $generationConfig = array_merge([
            'temperature'     => (float) $settings->temperature,
            'maxOutputTokens' => (int) $settings->max_output_tokens,
        ], $config);

        $payload = [
            'system_instruction' => ['parts' => [['text' => $systemPrompt]]],
            'contents'           => $contents,
            'generationConfig'   => $generationConfig,
        ];

        $response = Http::timeout($timeout)->post($url, $payload);

        if (! $response->successful()) {
            $status = $response->status();
            if ($status === 429) {
                throw new \App\Exceptions\GeminiQuotaExceededException(
                    'AI quota exceeded. Please wait a moment and try again.'
                );
            }
            throw new \RuntimeException(
                "Gemini API error {$status}: " . mb_substr($response->body(), 0, 300)
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

    /**
     * Streaming multi-turn request using Gemini's streamGenerateContent endpoint.
     *
     * Calls $onChunk for each text delta and returns token usage when stream ends.
     *
     * @param  array<array{role: string, parts: array}>  $contents
     * @param  callable(string $delta, bool $done, array $tokenUsage): void  $onChunk
     * @return array{token_usage: array<string,int>}
     * @throws \RuntimeException
     */
    public function streamWithHistory(string $systemPrompt, array $contents, callable $onChunk): array
    {
        $settings    = AiStudioSetting::current();
        $model       = $settings->gemini_model ?: (string) config('ai.gemini.model', 'gemini-1.5-flash');
        $timeout     = (int) $settings->timeout_seconds + 60; // extra for streaming

        $url = "{$this->baseUrl}/models/{$model}:streamGenerateContent?alt=sse&key={$this->apiKey}";

        $payload = [
            'system_instruction' => ['parts' => [['text' => $systemPrompt]]],
            'contents'           => $contents,
            'generationConfig'   => [
                'temperature'     => (float) $settings->temperature,
                'maxOutputTokens' => (int) $settings->max_output_tokens,
            ],
        ];

        $response = Http::withOptions(['stream' => true])
            ->timeout($timeout)
            ->post($url, $payload);

        if (! $response->successful()) {
            throw new \RuntimeException(
                "Gemini stream error {$response->status()}: " . mb_substr($response->body(), 0, 300)
            );
        }

        $tokenUsage = ['prompt_tokens' => 0, 'completion_tokens' => 0, 'total_tokens' => 0];
        $body       = $response->toPsrResponse()->getBody();

        $buffer = '';

        while (! $body->eof()) {
            $buffer .= $body->read(4096);

            // Process complete SSE lines from the buffer
            while (($pos = strpos($buffer, "\n")) !== false) {
                $line   = substr($buffer, 0, $pos);
                $buffer = substr($buffer, $pos + 1);

                if (! str_starts_with($line, 'data: ')) {
                    continue;
                }

                $jsonStr = substr($line, 6);

                if ($jsonStr === '[DONE]') {
                    $onChunk('', true, $tokenUsage);
                    break 2;
                }

                $chunk = json_decode($jsonStr, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    continue;
                }

                $delta = (string) data_get($chunk, 'candidates.0.content.parts.0.text', '');
                if ($delta !== '') {
                    $onChunk($delta, false, []);
                }

                // Capture final token usage from the last chunk
                if (data_get($chunk, 'usageMetadata') !== null) {
                    $tokenUsage = [
                        'prompt_tokens'     => (int) data_get($chunk, 'usageMetadata.promptTokenCount', 0),
                        'completion_tokens' => (int) data_get($chunk, 'usageMetadata.candidatesTokenCount', 0),
                        'total_tokens'      => (int) data_get($chunk, 'usageMetadata.totalTokenCount', 0),
                    ];
                }
            }
        }

        return ['token_usage' => $tokenUsage];
    }
}
