<?php

namespace App\Services\AI\Rag;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiEmbeddingService
{
    /**
     * Create a new service instance.
     */
    public function __construct() {}

    /**
     * Embed a text string and return a 768-dimensional float vector.
     *
     * @return float[]
     */
    public function embed(string $text): array
    {
        $apiKey  = config('gemini.api_key');
        $baseUrl = rtrim(config('gemini.base_url', 'https://generativelanguage.googleapis.com/v1beta'), '/');
        $model   = config('gemini.embedding.model', 'text-embedding-004');
        $timeout = (int) config('gemini.embedding.timeout', 30);

        $response = Http::withOptions(['timeout' => $timeout])
            ->post("{$baseUrl}/models/{$model}:embedContent?key={$apiKey}", [
                'model'   => "models/{$model}",
                'content' => [
                    'parts' => [['text' => $text]],
                ],
            ]);

        if (! $response->successful()) {
            throw new RuntimeException(
                'Gemini embedding API error: ' . $response->status() . ' ' . $response->body()
            );
        }

        $values = $response->json('embedding.values', []);

        if (empty($values)) {
            throw new RuntimeException('Gemini embedding returned empty values.');
        }

        return array_map('floatval', $values);
    }

    /**
     * Format an embedding array as a pgvector literal string.
     *
     * @param  float[]  $embedding
     */
    public function toVectorLiteral(array $embedding): string
    {
        return '[' . implode(',', $embedding) . ']';
    }
}
