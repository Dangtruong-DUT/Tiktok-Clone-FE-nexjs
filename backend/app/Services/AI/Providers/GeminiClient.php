<?php

namespace App\Services\AI\Providers;

use App\Exceptions\GeminiQuotaExceededException;
use App\Models\AiStudioSetting;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiClient
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = trim((string) config('ai.gemini.api_key'));
        $this->baseUrl = rtrim(
            (string) config('ai.gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'),
            '/'
        );

        if ($this->apiKey === '') {
            Log::error('[Gemini] GEMINI_API_KEY is empty.');
        }
    }

    /**
     * Generate normal non-stream response.
     *
     * @return array{text: string, token_usage: array<string,int>}
     */
    public function generate(string $systemPrompt, string $userPrompt): array
    {
        $settings = AiStudioSetting::current();

        $model = $this->resolveModel($settings);
        $timeout = (int) ($settings->timeout_seconds ?: config('ai.gemini.timeout', 60));

        $payload = [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemPrompt],
                ],
            ],
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        ['text' => $userPrompt],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature' => (float) $settings->temperature,
                'maxOutputTokens' => (int) $settings->max_output_tokens,
            ],
        ];

        return $this->sendGenerateRequest($model, $payload, $timeout, 'generate');
    }

    /**
     * Generate with conversation history.
     *
     * @param array<array{role: string, parts: array}> $contents
     * @param array<string,mixed> $config
     * @return array{text: string, token_usage: array<string,int>}
     */
    public function generateWithHistory(string $systemPrompt, array $contents, array $config = []): array
    {
        $settings = AiStudioSetting::current();

        $model = $this->resolveModel($settings);
        $timeout = (int) ($settings->timeout_seconds ?: config('ai.gemini.timeout', 60));

        $generationConfig = array_merge([
            'temperature' => (float) $settings->temperature,
            'maxOutputTokens' => (int) $settings->max_output_tokens,
        ], $config);

        $payload = [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemPrompt],
                ],
            ],
            'contents' => $this->normalizeContents($contents),
            'generationConfig' => $generationConfig,
        ];

        return $this->sendGenerateRequest($model, $payload, $timeout, 'generateWithHistory');
    }

    /**
     * Stream with conversation history.
     *
     * @param array<array{role: string, parts: array}> $contents
     * @param callable(string $delta, bool $done, array $tokenUsage): void $onChunk
     * @return array{token_usage: array<string,int>}
     */
    public function streamWithHistory(string $systemPrompt, array $contents, callable $onChunk): array
    {
        Log::debug('[Gemini] streamWithHistory() start', [
            'systemPromptLength' => mb_strlen($systemPrompt),
            'turns'      => count($contents),
            'key_prefix' => substr($this->apiKey, 0, 6) . '...',
            'key_ok'     => str_starts_with($this->apiKey, 'AIzaSy'),
        ]);
        $settings = AiStudioSetting::current();

        $model = $this->resolveModel($settings);
        $timeout = (int) ($settings->timeout_seconds ?: config('ai.gemini.timeout', 60)) + 60;

        $url = $this->buildUrl($model, 'streamGenerateContent', [
            'key' => $this->apiKey,
            'alt' => 'sse',
        ]);

        $payload = [
            'systemInstruction' => [
                'parts' => [
                    ['text' => $systemPrompt],
                ],
            ],
            'contents' => $this->normalizeContents($contents),
            'generationConfig' => [
                'temperature' => (float) $settings->temperature,
                'maxOutputTokens' => (int) $settings->max_output_tokens,
            ],
        ];

        Log::debug('[Gemini] streamWithHistory() request', [
            'model' => $model,
            'turns' => count($payload['contents']),
            'timeout' => $timeout,
        ]);

        $response = Http::withOptions([
            'stream' => true,
        ])
            ->timeout($timeout)
            ->connectTimeout(15)
            ->accept('text/event-stream')
            ->asJson()
            ->post($url, $payload);

        Log::debug('[Gemini] streamWithHistory() response', [
            'status' => $response->status(),
        ]);

        if (! $response->successful()) {
            $this->throwGeminiException(
                'streamWithHistory',
                $response->status(),
                $response->body(),
                $model
            );
        }

        $body = $response->toPsrResponse()->getBody();

        $buffer = '';
        $chunkCount = 0;

        $tokenUsage = [
            'prompt_tokens' => 0,
            'completion_tokens' => 0,
            'total_tokens' => 0,
        ];

        while (! $body->eof()) {
            $buffer .= $body->read(4096);

            while (($eventEnd = strpos($buffer, "\n\n")) !== false) {
                $rawEvent = substr($buffer, 0, $eventEnd);
                $buffer = substr($buffer, $eventEnd + 2);

                $dataLines = [];

                foreach (preg_split("/\r\n|\n|\r/", $rawEvent) as $line) {
                    $line = trim($line);

                    if ($line === '' || ! str_starts_with($line, 'data:')) {
                        continue;
                    }

                    $dataLines[] = trim(substr($line, 5));
                }

                if ($dataLines === []) {
                    continue;
                }

                $jsonStr = implode("\n", $dataLines);

                if ($jsonStr === '[DONE]') {
                    $onChunk('', true, $tokenUsage);

                    return [
                        'token_usage' => $tokenUsage,
                    ];
                }

                $chunk = json_decode($jsonStr, true);

                if (! is_array($chunk)) {
                    Log::warning('[Gemini] Invalid SSE JSON chunk', [
                        'chunk' => mb_substr($jsonStr, 0, 300),
                    ]);

                    continue;
                }

                $delta = (string) data_get($chunk, 'candidates.0.content.parts.0.text', '');

                if ($delta !== '') {
                    $chunkCount++;
                    $onChunk($delta, false, []);
                }

                if (data_get($chunk, 'usageMetadata') !== null) {
                    $tokenUsage = $this->extractTokenUsage($chunk);
                }
            }
        }

        if ($buffer !== '') {
            $this->handleRemainingStreamBuffer($buffer, $onChunk, $tokenUsage, $chunkCount);
        }

        Log::debug('[Gemini] streamWithHistory() completed', [
            'chunks' => $chunkCount,
            'usage'  => $tokenUsage,
        ]);

        if ($chunkCount === 0) {
            // Gemini returned HTTP 200 but sent no text — likely invalid API key or model name.
            Log::warning('[Gemini] Stream completed with 0 chunks — possible invalid key or model name.', [
                'model'      => $model,
                'key_prefix' => substr($this->apiKey, 0, 6) . '...',
            ]);
            throw new \RuntimeException('Gemini returned an empty stream. Check your API key and model name.');
        }

        $onChunk('', true, $tokenUsage);

        return [
            'token_usage' => $tokenUsage,
        ];
    }

    /**
     * Send normal generateContent request.
     *
     * @param array<string,mixed> $payload
     * @return array{text: string, token_usage: array<string,int>}
     */
    private function sendGenerateRequest(string $model, array $payload, int $timeout, string $action): array
    {
        $url = $this->buildUrl($model, 'generateContent', [
            'key' => $this->apiKey,
        ]);

        Log::debug("[Gemini] {$action}() request", [
            'model' => $model,
            'timeout' => $timeout,
        ]);

        $response = Http::timeout($timeout)
            ->connectTimeout(15)
            ->asJson()
            ->post($url, $payload);

        Log::debug("[Gemini] {$action}() response", [
            'status' => $response->status(),
        ]);

        if (! $response->successful()) {
            $this->throwGeminiException($action, $response->status(), $response->body(), $model);
        }

        $data = $response->json();

        $text = (string) data_get($data, 'candidates.0.content.parts.0.text', '');

        if ($text === '') {
            Log::warning("[Gemini] {$action}() returned empty text", [
                'response' => $data,
                'finish_reason' => data_get($data, 'candidates.0.finishReason'),
                'prompt_feedback' => data_get($data, 'promptFeedback'),
            ]);

            throw new \RuntimeException('Gemini returned an empty response body.');
        }

        return [
            'text' => $text,
            'token_usage' => $this->extractTokenUsage($data),
        ];
    }

    /**
     * Normalize Laravel message roles to Gemini roles.
     *
     * @param array<array{role: string, parts: array}> $contents
     * @return array<int,array{role: string, parts: array}>
     */
    private function normalizeContents(array $contents): array
    {
        return collect($contents)
            ->filter(fn (array $item): bool => ! empty($item['parts']))
            ->map(function (array $item): array {
                $role = $item['role'] ?? 'user';

                if ($role === 'assistant') {
                    $role = 'model';
                }

                if (! in_array($role, ['user', 'model'], true)) {
                    $role = 'user';
                }

                return [
                    'role' => $role,
                    'parts' => $this->normalizeParts($item['parts']),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param array<int,mixed> $parts
     * @return array<int,array{text: string}>
     */
    private function normalizeParts(array $parts): array
    {
        return collect($parts)
            ->map(function (mixed $part): array {
                if (is_string($part)) {
                    return ['text' => $part];
                }

                if (is_array($part) && isset($part['text'])) {
                    return ['text' => (string) $part['text']];
                }

                return ['text' => ''];
            })
            ->filter(fn (array $part): bool => trim($part['text']) !== '')
            ->values()
            ->all();
    }

    /**
     * @return array{prompt_tokens: int, completion_tokens: int, total_tokens: int}
     */
    private function extractTokenUsage(array $data): array
    {
        return [
            'prompt_tokens' => (int) data_get($data, 'usageMetadata.promptTokenCount', 0),
            'completion_tokens' => (int) data_get($data, 'usageMetadata.candidatesTokenCount', 0),
            'total_tokens' => (int) data_get($data, 'usageMetadata.totalTokenCount', 0),
        ];
    }

    private function resolveModel(AiStudioSetting $settings): string
    {
        return trim(
            (string) ($settings->gemini_model ?: config('ai.gemini.model', 'gemini-2.5-flash'))
        );
    }

    /**
     * @param array<string,string> $query
     */
    private function buildUrl(string $model, string $method, array $query): string
    {
        return sprintf(
            '%s/models/%s:%s?%s',
            $this->baseUrl,
            rawurlencode($model),
            $method,
            http_build_query($query)
        );
    }

    private function throwGeminiException(string $action, int $status, string $body, string $model): never
    {
        $safeBody = mb_substr($body, 0, 1000);

        Log::error("[Gemini] {$action}() failed", [
            'status' => $status,
            'body' => $safeBody,
            'model' => $model,
        ]);

        if ($status === 429) {
            throw new GeminiQuotaExceededException(
                'AI quota exceeded. Please wait a moment and try again.'
            );
        }

        throw new \RuntimeException("Gemini API error {$status}: {$safeBody}");
    }

    /**
     * Handle final buffered SSE event if stream ends without trailing blank line.
     *
     * @param callable(string $delta, bool $done, array $tokenUsage): void $onChunk
     */
    private function handleRemainingStreamBuffer(
        string $buffer,
        callable $onChunk,
        array &$tokenUsage,
        int &$chunkCount
    ): void {
        $dataLines = [];

        foreach (preg_split("/\r\n|\n|\r/", $buffer) as $line) {
            $line = trim($line);

            if ($line === '' || ! str_starts_with($line, 'data:')) {
                continue;
            }

            $dataLines[] = trim(substr($line, 5));
        }

        if ($dataLines === []) {
            return;
        }

        $jsonStr = implode("\n", $dataLines);

        if ($jsonStr === '[DONE]') {
            return;
        }

        $chunk = json_decode($jsonStr, true);

        if (! is_array($chunk)) {
            return;
        }

        $delta = (string) data_get($chunk, 'candidates.0.content.parts.0.text', '');

        if ($delta !== '') {
            $chunkCount++;
            $onChunk($delta, false, []);
        }

        if (data_get($chunk, 'usageMetadata') !== null) {
            $tokenUsage = $this->extractTokenUsage($chunk);
        }
    }
}
