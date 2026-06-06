<?php

namespace App\Services\AI\Rag;

use App\Jobs\EmbedDocumentChunkJob;
use App\Models\AiDocument;
use App\Models\AiDocumentChunk;
use Illuminate\Support\Str;

class DocumentIndexingService
{
    public function __construct(
        private readonly DocumentChunkingService $chunkingService,
    ) {}

    /**
     * Split a document into chunks and dispatch embedding jobs for each.
     */
    public function index(AiDocument $document): void
    {
        $chunks = $this->chunkingService->chunk($document->raw_content, $document->content_type);

        // Remove old chunks before re-indexing
        $document->chunks()->delete();

        $chunkModels = [];
        foreach ($chunks as $i => $text) {
            $chunkModels[] = AiDocumentChunk::create([
                'uuid'           => Str::uuid()->toString(),
                'ai_document_id' => $document->id,
                'chunk_index'    => $i,
                'content'        => $text,
                'token_count'    => $this->chunkingService->estimateTokens($text),
                'is_embedded'    => false,
            ]);
        }

        $document->update([
            'is_indexed' => false,
            'chunk_count' => count($chunkModels),
        ]);

        // Dispatch embedding jobs — stagger slightly to avoid rate-limit bursts
        foreach ($chunkModels as $chunk) {
            EmbedDocumentChunkJob::dispatch($chunk->id)->onQueue('ai-embedding');
        }
    }

    /**
     * Re-index all documents (useful for schema migrations or model changes).
     */
    public function reindexAll(): void
    {
        AiDocument::each(fn (AiDocument $doc) => $this->index($doc));
    }
}
