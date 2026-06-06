<?php

namespace App\Jobs;

use App\Models\AiDocumentChunk;
use App\Services\AI\Rag\GeminiEmbeddingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class EmbedDocumentChunkJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 60; // seconds between retries (handles Gemini rate limits)

    public function __construct(private readonly int $chunkId) {}

    public function handle(GeminiEmbeddingService $embeddingService): void
    {
        $chunk = AiDocumentChunk::find($this->chunkId);

        if (! $chunk || $chunk->is_embedded) {
            return;
        }

        $embedding = $embeddingService->embed($chunk->content);

        // Store as pgvector literal — Eloquent cast (array) would JSON-encode it,
        // so we use a raw update to write the vector literal directly.
        DB::statement(
            'UPDATE ai_document_chunks SET embedding = ?::vector, is_embedded = true WHERE id = ?',
            ['[' . implode(',', $embedding) . ']', $chunk->id]
        );

        // Check if all siblings are embedded; if so, mark document as indexed
        $document = $chunk->document;
        $pending  = $document->chunks()->where('is_embedded', false)->count();

        if ($pending === 0) {
            $document->update([
                'is_indexed' => true,
                'indexed_at' => now(),
            ]);
        }
    }
}
