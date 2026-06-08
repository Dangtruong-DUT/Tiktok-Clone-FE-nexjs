<?php

namespace App\Jobs;

use App\Models\AiDocument;
use App\Services\AI\Rag\DocumentIndexingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class IndexDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $backoff = 30;

    public function __construct(private readonly int $documentId) {}

    public function handle(DocumentIndexingService $indexingService): void
    {
        $document = AiDocument::find($this->documentId);

        if (! $document) {
            return;
        }

        $indexingService->index($document);
    }
}
