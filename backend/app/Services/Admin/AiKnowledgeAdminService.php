<?php

namespace App\Services\Admin;

use App\Contracts\Upload\UploadFileServiceInterface;
use App\Jobs\IndexDocumentJob;
use App\Models\AiDocument;
use App\Repositories\AiDocumentRepository;
use App\Services\AI\Rag\DocumentTextExtractorService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AiKnowledgeAdminService
{
    /**
     * @param  AiDocumentRepository       $documentRepo
     * @param  DocumentTextExtractorService  $extractor
     * @param  UploadFileServiceInterface  $uploadFileService
     */
    public function __construct(
        private readonly AiDocumentRepository        $documentRepo,
        private readonly DocumentTextExtractorService $extractor,
        private readonly UploadFileServiceInterface  $uploadFileService,
    ) {}

    /**
     * Get paginated AI knowledge documents.
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator<int,AiDocument>
     */
    public function listDocuments(array $filters = []): LengthAwarePaginator
    {
        return $this->documentRepo->paginateLatest((int) ($filters['per_page'] ?? 20));
    }

    /**
     * Upload and register a new knowledge document.
     *
     * @param  array<string,mixed>  $data
     * @param  UploadedFile|null    $file
     * @return AiDocument
     */
    public function uploadDocument(array $data, ?UploadedFile $file = null): AiDocument
    {
        $title       = (string) $data['title'];
        $sourceType  = (string) $data['source_type'];
        $language    = (string) ($data['language'] ?? 'vi');
        $rawContent  = isset($data['raw_content']) ? (string) $data['raw_content'] : null;
        $filePath    = null;
        $fileDisk    = null;
        $uploadFileId = null;

        if ($file !== null) {
            $rawContent  = $this->extractor->extract($file);
            $contentType = 'text';

            $uploadedFile = $this->uploadFileService->uploadFile($file, 'ai-documents');
            $filePath     = $uploadedFile->file_path;
            $fileDisk     = $uploadedFile->disk;
            $uploadFileId = $uploadedFile->id;
        } else {
            $contentType = 'markdown';
        }

        /** @var AiDocument $document */
        $document = $this->documentRepo->create([
            'title'          => $title,
            'description'    => $data['description'] ?? null,
            'source_type'    => $sourceType,
            'file_path'      => $filePath,
            'file_disk'      => $fileDisk,
            'upload_file_id' => $uploadFileId,
            'raw_content'    => $rawContent,
            'content_type'   => $contentType,
            'language'       => $language,
            'is_indexed'     => false,
        ]);

        IndexDocumentJob::dispatch($document->id);

        Cache::forget('rag_knowledge_catalog');

        return $document;
    }

    /**
     * Get a knowledge document by UUID.
     *
     * @param  string  $uuid
     * @return AiDocument
     */
    public function getDocument(string $uuid): AiDocument
    {
        return $this->documentRepo->findByUuid($uuid);
    }

    /**
     * Delete a knowledge document and its associated file atomically.
     *
     * @param  string  $uuid
     * @return void
     */
    public function destroyDocument(string $uuid): void
    {
        /** @var AiDocument $document */
        $document = $this->documentRepo->findByUuid($uuid);

        DB::transaction(function () use ($document) {
            if ($document->uploadFile) {
                $this->uploadFileService->deleteFile($document->uploadFile);
            } elseif ($document->file_path && $document->file_disk) {
                // Legacy documents uploaded before upload_file_id column was added.
                Storage::disk($document->file_disk)->delete($document->file_path);
            }

            $document->chunks()->delete();
            $document->delete();
        });

        Cache::forget('rag_knowledge_catalog');
    }
}
