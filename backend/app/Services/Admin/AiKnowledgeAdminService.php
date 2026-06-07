<?php

namespace App\Services\Admin;

use App\Jobs\IndexDocumentJob;
use App\Models\AiDocument;
use App\Repositories\AiDocumentRepository;
use App\Services\AI\Rag\DocumentTextExtractorService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AiKnowledgeAdminService
{
    /**
     * Create a new service instance.
     *
     * @param  AiDocumentRepository  $documentRepo
     * @param  DocumentTextExtractorService  $extractor
     */
    public function __construct(
        private readonly AiDocumentRepository $documentRepo,
        private readonly DocumentTextExtractorService $extractor,
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
     * @param  array<string,mixed>  $data
     * @param  UploadedFile|null  $file
     * @return AiDocument
     */
    public function uploadDocument(array $data, ?UploadedFile $file = null): AiDocument
    {
        $title = (string) $data['title'];
        $sourceType = (string) $data['source_type'];
        $language = (string) ($data['language'] ?? 'vi');
        $rawContent = isset($data['raw_content']) ? (string) $data['raw_content'] : null;
        $filePath = null;
        $fileDisk = null;

        if ($file !== null) {
            $rawContent  = $this->extractor->extract($file);
            $contentType = 'text';

            $disk     = config('filesystems.default', 's3');
            $ext      = $file->getClientOriginalExtension();
            $fileName = Str::uuid()->toString() . '.' . $ext;
            $filePath = 'ai-documents/' . $fileName;

            Storage::disk($disk)->putFileAs('ai-documents', $file, $fileName, 'public');
            $fileDisk = $disk;
        } else {
            $contentType = 'markdown';
        }

        /** @var AiDocument $document */
        $document = $this->documentRepo->create([
            'uuid'         => Str::uuid()->toString(),
            'title'        => $title,
            'source_type'  => $sourceType,
            'file_path'    => $filePath,
            'file_disk'    => $fileDisk,
            'raw_content'  => $rawContent,
            'content_type' => $contentType,
            'language'     => $language,
            'is_indexed'   => false,
        ]);

        IndexDocumentJob::dispatch($document->id);

        return $document;
    }

    /**
     * Get a knowledge document by ID.
     *
     * @param  int  $id
     * @return AiDocument
     */
    public function getDocument(int $id): AiDocument
    {
        /** @var AiDocument */
        return $this->documentRepo->findOrFail($id);
    }

    /**
     * Delete a knowledge document by ID.
     *
     * @param  int  $id
     * @return void
     */
    public function destroyDocument(int $id): void
    {
        /** @var AiDocument $document */
        $document = $this->documentRepo->findOrFail($id);

        if ($document->file_path && $document->file_disk) {
            Storage::disk($document->file_disk)->delete($document->file_path);
        }

        $document->chunks()->delete();
        $document->delete();
    }
}
