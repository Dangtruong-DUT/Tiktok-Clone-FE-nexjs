<?php

namespace App\Services\AI\Rag;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiEmbeddingService
{
    private const MODEL = 'text-embedding-004';

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

        $response = Http::withOptions(['timeout' => 30])
            ->post("{$baseUrl}/models/" . self::MODEL . ":embedContent?key={$apiKey}", [
                'model'   => 'models/' . self::MODEL,
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
