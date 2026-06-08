<?php

namespace App\Services\AI\Rag;

use App\Jobs\EmbedDocumentChunkJob;
use App\Models\AiDocument;
use App\Models\AiDocumentChunk;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DocumentIndexingService
{
    /**
     * @param  DocumentChunkingService  $chunkingService
     */
    public function __construct(
        private readonly DocumentChunkingService $chunkingService,
    ) {}

    /**
     * Split a document into chunks and dispatch embedding jobs for each.
     * Chunk deletion + insertion + document update run inside a single transaction
     * so a mid-process crash cannot leave the document with zero chunks.
     */
    public function index(AiDocument $document): void
    {
        $chunks = $this->chunkingService->chunk($document->raw_content, $document->content_type);

        DB::transaction(function () use ($document, $chunks) {
            $document->chunks()->delete();

            $now  = now();
            $rows = [];
            foreach ($chunks as $i => $text) {
                $rows[] = [
                    'uuid'           => Str::uuid()->toString(),
                    'ai_document_id' => $document->id,
                    'chunk_index'    => $i,
                    'content'        => $text,
                    'token_count'    => $this->chunkingService->estimateTokens($text),
                    'is_embedded'    => false,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ];
            }

            if (! empty($rows)) {
                AiDocumentChunk::insert($rows);
            }

            $document->update([
                'is_indexed'  => false,
                'chunk_count' => count($rows),
            ]);
        });

        // Dispatch outside the transaction so jobs only run after the commit.
        $chunkIds = AiDocumentChunk::where('ai_document_id', $document->id)
            ->orderBy('chunk_index')
            ->pluck('id');

        foreach ($chunkIds as $chunkId) {
            EmbedDocumentChunkJob::dispatch($chunkId)->onQueue('ai-embedding');
        }
    }

    /**
     * Re-index all documents (useful after schema migrations or model changes).
     */
    public function reindexAll(): void
    {
        AiDocument::each(fn (AiDocument $doc) => $this->index($doc));
    }
}
