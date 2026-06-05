<?php

namespace App\Services\AI\Providers;

use App\Exceptions\GeminiQuotaExceededException;
use App\Models\AiStudioSetting;
use Gemini\Data\Blob;
use Gemini\Data\Content;
use Gemini\Data\GenerationConfig;
use Gemini\Data\Part;
use Gemini\Data\UsageMetadata;
use Gemini\Enums\ResponseMimeType;
use Gemini\Enums\Role;
use Gemini\Laravel\Facades\Gemini;
use Gemini\Responses\GenerativeModel\GenerateContentResponse;
use GuzzleHttp\Client as GuzzleClient;
use GuzzleHttp\Exception\BadResponseException;
use GuzzleHttp\Exception\ConnectException;
use Illuminate\Support\Facades\Log;

/**
 * Thin adapter over google-gemini-php/laravel.
 * Public interface is unchanged — all callers (GeminiAiService, AiCopilotStreamingService) require zero changes.
 */
class GeminiClient
{
    /**
     * Single-turn generation (no history).
     *
     * @return array{text: string, token_usage: array<string,int>}
     */
    public function generate(string $systemPrompt, string $userPrompt): array
    {
        $settings = AiStudioSetting::current();
        $model    = $this->resolveModel($settings);

        Log::debug('[Gemini] generate()', ['model' => $model]);

        try {
            $response = Gemini::generativeModel(model: $model)
                ->withSystemInstruction(Content::parse(part: $systemPrompt, role: Role::USER))
                ->withGenerationConfig($this->buildConfig($settings))
                ->generateContent($userPrompt);

            $text = $this->responseText($response);

            if ($text === '') {
                Log::warning('[Gemini] generate() returned empty text');
                throw new \RuntimeException('Gemini returned an empty response body.');
            }

            return [
                'text'        => $text,
                'token_usage' => $this->extractUsage($response->usageMetadata),
            ];
        } catch (\Gemini\Exceptions\ErrorException
                |\Gemini\Exceptions\TransporterException
                |\Gemini\Exceptions\UnserializableResponse $e) {
            $this->fail('generate', $e);
        }
    }

    /**
     * Multi-turn generation with conversation history.
     *
     * @param  array<array{role: string, parts: array}>  $contents  Last element must be the user turn.
     * @param  array<string,mixed>  $config  Optional overrides: temperature, maxOutputTokens, responseMimeType.
     * @return array{text: string, token_usage: array<string,int>}
     */
    public function generateWithHistory(string $systemPrompt, array $contents, array $config = []): array
    {
        $settings = AiStudioSetting::current();
        $model    = $this->resolveModel($settings);

        Log::debug('[Gemini] generateWithHistory()', ['model' => $model, 'turns' => count($contents)]);

        [$history, $lastRawParts] = $this->splitContents($contents);
        $userContent = $this->buildContent($lastRawParts, Role::USER);

        try {
            $response = Gemini::generativeModel(model: $model)
                ->withSystemInstruction(Content::parse(part: $systemPrompt, role: Role::USER))
                ->withGenerationConfig($this->buildConfig($settings, $config))
                ->startChat(history: $history)
                ->sendMessage($userContent);

            $text = $this->responseText($response);

            if ($text === '') {
                throw new \RuntimeException('Gemini returned an empty response body.');
            }

            return [
                'text'        => $text,
                'token_usage' => $this->extractUsage($response->usageMetadata),
            ];
        } catch (\Gemini\Exceptions\ErrorException
                |\Gemini\Exceptions\TransporterException
                |\Gemini\Exceptions\UnserializableResponse $e) {
            $this->fail('generateWithHistory', $e);
        }
    }

    /**
     * Streaming multi-turn generation via direct SSE HTTP call.
     *
     * Uses the Gemini REST ?alt=sse endpoint instead of the PHP SDK's stream deserializer,
     * which breaks on gemini-2.5+ because those models emit thought-only chunks that lack
     * usageMetadata — causing the SDK to throw UnserializableResponse on every request.
     *
     * Calls $onChunk($delta, false, []) for each text chunk,
     * then $onChunk('', true, $tokenUsage) once when the stream is complete.
     *
     * @param  array<array{role: string, parts: array}>  $contents
     * @param  callable(string $delta, bool $done, array $tokenUsage): void  $onChunk
     * @return array{token_usage: array<string,int>}
     */
    public function streamWithHistory(string $systemPrompt, array $contents, callable $onChunk): array
    {
        $settings = AiStudioSetting::current();
        $model    = $this->resolveModel($settings);

        Log::debug('[Gemini] streamWithHistory()', ['model' => $model, 'turns' => count($contents)]);

        [$history, $lastRawParts] = $this->splitContents($contents);

        $apiKey  = config('gemini.api_key');
        $baseUrl = rtrim((string) config('gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'), '/');
        $modelId = str_starts_with($model, 'models/') ? $model : "models/{$model}";
        $url     = "{$baseUrl}/{$modelId}:streamGenerateContent";

        $normalizedParts = [];
        foreach ($lastRawParts as $part) {
            if (! is_array($part)) {
                continue;
            }
            if (isset($part['inlineData']) && is_array($part['inlineData'])) {
                $normalizedParts[] = ['inlineData' => $part['inlineData']];
            } elseif (isset($part['text']) && trim((string) $part['text']) !== '') {
                $normalizedParts[] = ['text' => (string) $part['text']];
            }
        }

        $requestBody = [
            'contents' => array_merge(
                array_map(fn (Content $c) => $c->toArray(), $history),
                !empty($normalizedParts) ? [['role' => 'user', 'parts' => $normalizedParts]] : [],
            ),
            'systemInstruction' => Content::parse(part: $systemPrompt, role: Role::USER)->toArray(),
            'generationConfig'  => $this->buildConfig($settings)->toArray(),
        ];

        try {
            $client   = new GuzzleClient(['timeout' => $settings->timeout_seconds + 5]);
            $response = $client->post($url, [
                'query'  => ['alt' => 'sse', 'key' => $apiKey],
                'json'   => $requestBody,
                'stream' => true,
            ]);

            $body       = $response->getBody();
            $chunkCount = 0;
            $tokenUsage = ['prompt_tokens' => 0, 'completion_tokens' => 0, 'total_tokens' => 0];
            $lineBuf    = '';

            while (! $body->eof()) {
                $byte = $body->read(1);

                if ($byte !== "\n") {
                    $lineBuf .= $byte;
                    continue;
                }

                $line    = rtrim($lineBuf, "\r");
                $lineBuf = '';

                if (! str_starts_with($line, 'data: ')) {
                    continue;
                }

                $data = json_decode(substr($line, 6), true);
                if (! is_array($data)) {
                    continue;
                }

                $delta = '';
                foreach ($data['candidates'][0]['content']['parts'] ?? [] as $part) {
                    if (($part['thought'] ?? false) !== true) {
                        $delta .= $part['text'] ?? '';
                    }
                }

                if ($delta !== '') {
                    $chunkCount++;
                    $onChunk($delta, false, []);
                }

                if (isset($data['usageMetadata'])) {
                    $tokenUsage = [
                        'prompt_tokens'     => $data['usageMetadata']['promptTokenCount']     ?? 0,
                        'completion_tokens' => $data['usageMetadata']['candidatesTokenCount'] ?? 0,
                        'total_tokens'      => $data['usageMetadata']['totalTokenCount']      ?? 0,
                    ];
                }
            }

            if ($chunkCount === 0) {
                Log::warning('[Gemini] 0 chunks received', ['model' => $model]);
                throw new \RuntimeException('Gemini returned an empty stream. Check your API key and model name.');
            }

            Log::debug('[Gemini] streamWithHistory() done', ['chunks' => $chunkCount, 'usage' => $tokenUsage]);

            $onChunk('', true, $tokenUsage);

            return ['token_usage' => $tokenUsage];

        } catch (BadResponseException $e) {
            $status  = $e->getResponse()->getStatusCode();
            $rawBody = $e->getResponse()->getBody()->getContents();
            $decoded = json_decode($rawBody, true);
            $message = $decoded['error']['message'] ?? $rawBody;

            Log::error('[Gemini] streamWithHistory() HTTP error', ['status' => $status, 'message' => $message]);

            if ($status === 401 || str_contains($message, 'API_KEY_INVALID') || str_contains($message, 'Unauthorized')) {
                throw new \RuntimeException('Cấu hình AI không hợp lệ — vui lòng kiểm tra API key trong cài đặt.');
            }
            if ($status === 429 || str_contains($message, 'RESOURCE_EXHAUSTED')) {
                throw new GeminiQuotaExceededException('AI đang bận xử lý nhiều yêu cầu — vui lòng thử lại sau vài giây.');
            }
            if ($status === 503 || str_contains($message, 'overloaded')) {
                throw new \RuntimeException('AI hiện đang quá tải — vui lòng thử lại sau.');
            }

            throw new \RuntimeException("Gemini API error ({$status}): {$message}");

        } catch (ConnectException $e) {
            Log::error('[Gemini] streamWithHistory() connection error', ['message' => $e->getMessage()]);
            throw new \RuntimeException('Không thể kết nối đến AI — vui lòng kiểm tra kết nối và thử lại.');
        }
    }


    /**
     * Split a contents array into (history: Content[], lastRawParts: array).
     *
     * The last element is the current user turn — returned as raw parts so callers
     * can preserve inlineData (video clip, image frames) rather than stripping them.
     * History turns are text-only Content objects (multimodal history not supported by SDK).
     *
     * @param  array<array{role: string, parts: array}>  $contents
     * @return array{0: Content[], 1: array}
     */
    private function splitContents(array $contents): array
    {
        if (empty($contents)) {
            throw new \InvalidArgumentException('[GeminiClient] contents array must not be empty.');
        }

        $last    = array_pop($contents);
        $history = array_values(array_filter(
            array_map(fn (array $item) => $this->toContent($item), $contents)
        ));

        return [$history, $last['parts'] ?? []];
    }

    /**
     * Build a SDK Content object from a raw parts array, preserving inlineData blobs.
     *
     * @param  array<mixed>  $rawParts
     */
    private function buildContent(array $rawParts, Role $role): Content
    {
        $parts = [];

        foreach ($rawParts as $part) {
            if (! is_array($part)) {
                continue;
            }

            if (isset($part['inlineData']) && is_array($part['inlineData'])) {
                $parts[] = new Part(inlineData: Blob::from($part['inlineData']));
            } elseif (isset($part['text']) && trim((string) $part['text']) !== '') {
                $parts[] = new Part(text: (string) $part['text']);
            }
        }

        if (empty($parts)) {
            $parts = [new Part(text: '')];
        }

        return new Content(parts: $parts, role: $role);
    }

    /**
     * Find the first non-empty text in a parts array.
     * Handles multimodal turns where inlineData comes before the text part.
     *
     * @param  array<mixed>  $parts
     */
    private function extractText(array $parts): string
    {
        foreach ($parts as $part) {
            if (is_array($part) && isset($part['text']) && trim((string) $part['text']) !== '') {
                return (string) $part['text'];
            }
        }

        return '';
    }

    private function toContent(array $item): ?Content
    {
        $text = $this->extractText($item['parts'] ?? []);

        if ($text === '') {
            return null;
        }

        $role = ($item['role'] ?? 'user') === 'model' ? Role::MODEL : Role::USER;

        return Content::parse(part: $text, role: $role);
    }

    /**
     * Safely extract the text from a GenerateContentResponse without throwing.
     * Handles partial stream chunks where candidates may be empty.
     */
    private function responseText(GenerateContentResponse $response): string
    {
        if (empty($response->candidates)) {
            return '';
        }

        $text = '';

        foreach (($response->candidates[0]->content?->parts ?? []) as $part) {
            if ($part->thought !== true) {
                $text .= $part->text ?? '';
            }
        }

        return $text;
    }

    /**
     * Build a GenerationConfig, merging DB settings with optional per-call overrides.
     *
     * Recognized override keys: temperature, maxOutputTokens, responseMimeType.
     *
     * @param  array<string,mixed>  $overrides
     */
    private function buildConfig(AiStudioSetting $settings, array $overrides = []): GenerationConfig
    {
        $mimeType = null;

        if (isset($overrides['responseMimeType'])) {
            $mimeType = ResponseMimeType::from((string) $overrides['responseMimeType']);
        }

        return new GenerationConfig(
            maxOutputTokens:  (int)   ($overrides['maxOutputTokens'] ?? $settings->max_output_tokens),
            temperature:      (float) ($overrides['temperature']     ?? $settings->temperature),
            responseMimeType: $mimeType,
        );
    }

    private function resolveModel(AiStudioSetting $settings): string
    {
        return trim((string) ($settings->gemini_model ?: config('gemini.model', 'gemini-2.0-flash')));
    }

    /**
     * @return array{prompt_tokens: int, completion_tokens: int, total_tokens: int}
     */
    private function extractUsage(UsageMetadata $meta): array
    {
        return [
            'prompt_tokens'     => $meta->promptTokenCount,
            'completion_tokens' => $meta->candidatesTokenCount ?? 0,
            'total_tokens'      => $meta->totalTokenCount,
        ];
    }

    /** @throws \RuntimeException|\App\Exceptions\GeminiQuotaExceededException */
    private function fail(string $action, \Exception $e): never
    {
        $message = $e->getMessage();

        // TransporterException wraps a GuzzleHttp ClientException — extract HTTP status
        $statusCode = 0;
        if ($e instanceof \Gemini\Exceptions\TransporterException) {
            $prev = $e->getPrevious();
            if ($prev instanceof \GuzzleHttp\Exception\ClientException) {
                $statusCode = $prev->getResponse()?->getStatusCode() ?? 0;
            }
        } elseif ($e instanceof \Gemini\Exceptions\ErrorException) {
            $statusCode = $e->getErrorCode();
        }

        Log::error("[Gemini] {$action}() error", [
            'type'    => get_class($e),
            'status'  => $statusCode,
            'message' => $message,
        ]);

        if ($statusCode === 401 || str_contains($message, '401') || str_contains($message, 'Unauthorized') || str_contains($message, 'API_KEY_INVALID')) {
            throw new \RuntimeException('Cấu hình AI không hợp lệ — vui lòng kiểm tra API key trong cài đặt.');
        }

        if ($statusCode === 429 || str_contains($message, '429') || str_contains($message, 'RESOURCE_EXHAUSTED')) {
            throw new GeminiQuotaExceededException('AI đang bận xử lý nhiều yêu cầu — vui lòng thử lại sau vài giây.');
        }

        if ($statusCode === 503 || str_contains($message, '503') || str_contains($message, 'overloaded')) {
            throw new \RuntimeException('AI hiện đang quá tải — vui lòng thử lại sau.');
        }

        // UnserializableResponse = empty/malformed body from API (often a silent auth failure)
        if ($e instanceof \Gemini\Exceptions\UnserializableResponse) {
            throw new \RuntimeException('Không nhận được phản hồi hợp lệ từ AI — vui lòng kiểm tra API key và thử lại.');
        }

        throw new \RuntimeException("Gemini API error: {$message}");
    }
}