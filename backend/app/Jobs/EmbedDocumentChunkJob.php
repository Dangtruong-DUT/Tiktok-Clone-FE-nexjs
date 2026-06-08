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
use Illuminate\Support\Facades\Log;

class EmbedDocumentChunkJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 60;

    public function __construct(private readonly int $chunkId) {}

    /**
     * @param  GeminiEmbeddingService  $embeddingService
     * @return void
     */
    public function handle(GeminiEmbeddingService $embeddingService): void
    {
        $chunk = AiDocumentChunk::find($this->chunkId);

        if (! $chunk || $chunk->is_embedded) {
            return;
        }

        $embedding = $embeddingService->embed($chunk->content, 'RETRIEVAL_DOCUMENT');

        // Raw UPDATE — Eloquent's 'array' cast would JSON-encode the vector literal, so bypass it.
        DB::statement(
            'UPDATE ai_document_chunks SET embedding = ?::vector, is_embedded = true WHERE id = ?',
            [$embeddingService->toVectorLiteral($embedding), $chunk->id]
        );

        // Mark document as fully indexed once all sibling chunks are embedded.
        $document = $chunk->document;
        $pending  = $document->chunks()->where('is_embedded', false)->count();

        if ($pending === 0) {
            $document->update([
                'is_indexed' => true,
                'indexed_at' => now(),
            ]);
        }
    }

    /**
     * Called by the queue worker after all retries are exhausted.
     * Logs the failure so admins can see which documents are stuck un-indexed.
     */
    public function failed(\Throwable $e): void
    {
        $chunk = AiDocumentChunk::find($this->chunkId);

        Log::channel(config('ai.logging.channel', 'stack'))->error('EmbedDocumentChunkJob permanently failed', [
            'chunk_id'    => $this->chunkId,
            'document_id' => $chunk?->ai_document_id,
            'error'       => $e->getMessage(),
        ]);
    }
}
