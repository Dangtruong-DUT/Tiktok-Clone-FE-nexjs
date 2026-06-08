<?php

namespace App\Services\AI\Rag;

use App\Contracts\AI\GeminiClientInterface;

class GeminiEmbeddingService
{
    public function __construct(
        private readonly GeminiClientInterface $geminiClient,
    ) {}

    /**
     * Embed a text string and return a 768-dimensional float vector.
     *
     * @param  string  $taskType  RETRIEVAL_QUERY (user question) | RETRIEVAL_DOCUMENT (chunk at index time)
     * @return float[]
     */
    public function embed(string $text, string $taskType = 'RETRIEVAL_QUERY'): array
    {
        return $this->geminiClient->embed($text, $taskType);
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
