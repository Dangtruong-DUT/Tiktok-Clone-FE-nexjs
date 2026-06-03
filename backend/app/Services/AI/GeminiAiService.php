<?php

namespace App\Services\AI;

use App\Services\AI\Providers\GeminiClient;
use Illuminate\Support\Facades\Log;

/**
 * Thin wrapper around GeminiClient with retry logic and structured JSON generation.
 */
class GeminiAiService
{
    private const MAX_RETRIES    = 2;
    private const RETRY_DELAY_MS = 1000;

    public function __construct(
        private readonly GeminiClient $client,
    ) {}

    /**
     * Execute a prompt with automatic retry on transient failures.
     *
     * @return array{text: string, token_usage: array<string,int>}
     * @throws \RuntimeException when all retries are exhausted
     */
    public function generate(string $systemPrompt, string $userPrompt): array
    {
        $lastException = null;

        for ($attempt = 1; $attempt <= self::MAX_RETRIES + 1; $attempt++) {
            try {
                return $this->client->generate($systemPrompt, $userPrompt);
            } catch (\RuntimeException $e) {
                $lastException = $e;

                if ($attempt <= self::MAX_RETRIES) {
                    usleep(self::RETRY_DELAY_MS * 1000 * $attempt);
                    Log::channel('ai')->warning('Gemini transient failure, retrying', [
                        'attempt' => $attempt,
                        'error'   => mb_substr($e->getMessage(), 0, 200),
                    ]);
                }
            }
        }

        throw $lastException ?? new \RuntimeException('Gemini generation failed after retries.');
    }

    /**
     * Generate and parse a JSON response, validating required keys.
     *
     * @param  array<string>  $requiredKeys
     * @return array{data: array<string,mixed>, token_usage: array<string,int>}
     * @throws \RuntimeException on parse/validation failure
     */
    public function generateJson(string $systemPrompt, string $userPrompt, array $requiredKeys = []): array
    {
        $result = $this->generate($systemPrompt, $userPrompt);

        $clean = (string) preg_replace('/^```(?:json)?\s*/m', '', $result['text']);
        $clean = (string) preg_replace('/```\s*$/m', '', $clean);
        $clean = trim($clean);

        $data = json_decode($clean, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException('Gemini returned invalid JSON: ' . json_last_error_msg());
        }

        foreach ($requiredKeys as $key) {
            if (! array_key_exists($key, $data)) {
                throw new \RuntimeException("Missing required field in AI response: {$key}");
            }
        }

        return ['data' => $data, 'token_usage' => $result['token_usage']];
    }
}
