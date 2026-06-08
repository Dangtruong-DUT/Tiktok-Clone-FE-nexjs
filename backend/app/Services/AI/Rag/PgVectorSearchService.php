<?php

namespace App\Services\AI\Rag;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PgVectorSearchService
{
    public function __construct(
        private readonly GeminiEmbeddingService $embeddingService,
    ) {}
    /**
     * Find the most semantically similar embedded chunks to the given query vector.
     *
     * @param  float[]  $embedding   Query embedding from GeminiEmbeddingService
     * @param  int      $limit       Max number of chunks to return
     * @param  float    $threshold   Minimum cosine similarity (0–1)
     * @return Collection<object{id, uuid, ai_document_id, chunk_index, content, token_count, similarity}>
     */
    public function search(array $embedding, int $limit = 5, float $threshold = 0.70): Collection
    {
        $vectorLiteral = $this->embeddingService->toVectorLiteral($embedding);

        $rows = DB::select(
            <<<SQL
            SELECT
                c.id,
                c.uuid,
                c.ai_document_id,
                c.chunk_index,
                c.content,
                c.token_count,
                d.title         AS document_title,
                d.source_type   AS document_source_type,
                d.source_url    AS document_source_url,
                1 - (c.embedding <=> ?::vector) AS similarity
            FROM ai_document_chunks c
            JOIN ai_documents d ON d.id = c.ai_document_id
            WHERE c.is_embedded = true
              AND 1 - (c.embedding <=> ?::vector) >= ?
            ORDER BY c.embedding <=> ?::vector
            LIMIT ?
            SQL,
            [$vectorLiteral, $vectorLiteral, $threshold, $vectorLiteral, $limit]
        );

        return collect($rows);
    }
}