<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Admin\AiDocumentAdminResource;
use App\Http\Resources\Api\Admin\AiDocumentDetailAdminResource;
use App\Http\Response\ApiResponse;
use App\Jobs\IndexDocumentJob;
use App\Models\AiDocument;
use App\Services\AI\Rag\DocumentTextExtractorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AiKnowledgeAdminController extends Controller
{
    public function __construct(
        private readonly DocumentTextExtractorService $extractor,
    ) {}

    public function indexDocuments(Request $request): JsonResponse
    {
        $documents = AiDocument::latest()
            ->paginate((int) $request->query('per_page', 20));

        return ApiResponse::success(AiDocumentAdminResource::collection($documents));
    }

    public function uploadDocument(Request $request): JsonResponse
    {
        $request->validate([
            'file'        => ['required_without:raw_content', 'file', 'mimes:pdf,txt,docx,doc', 'max:10240'],
            'raw_content' => ['required_without:file', 'string'],
            'title'       => ['required', 'string', 'max:255'],
            'source_type' => ['required', 'in:faq,guide,policy,feature,other'],
            'language'    => ['nullable', 'string', 'max:10'],
        ]);

        $filePath = null;
        $fileDisk = null;

        if ($request->hasFile('file')) {
            $file        = $request->file('file');
            $rawContent  = $this->extractor->extract($file);
            $contentType = 'text';

            $disk     = config('filesystems.default', 's3');
            $ext      = $file->getClientOriginalExtension();
            $fileName = Str::uuid()->toString() . '.' . $ext;
            $filePath = 'ai-documents/' . $fileName;

            Storage::disk($disk)->putFileAs('ai-documents', $file, $fileName, 'public');
            $fileDisk = $disk;
        } else {
            $rawContent  = $request->input('raw_content');
            $contentType = 'markdown';
        }

        $document = AiDocument::create([
            'uuid'         => Str::uuid()->toString(),
            'title'        => $request->input('title'),
            'source_type'  => $request->input('source_type'),
            'file_path'    => $filePath,
            'file_disk'    => $fileDisk,
            'raw_content'  => $rawContent,
            'content_type' => $contentType,
            'language'     => $request->input('language', 'vi'),
            'is_indexed'   => false,
        ]);

        IndexDocumentJob::dispatch($document->id);

        return ApiResponse::success(new AiDocumentAdminResource($document), 201);
    }

    public function showDocument(int $id): JsonResponse
    {
        $document = AiDocument::findOrFail($id);

        return ApiResponse::success(new AiDocumentDetailAdminResource($document));
    }

    public function destroyDocument(int $id): JsonResponse
    {
        $document = AiDocument::findOrFail($id);

        if ($document->file_path && $document->file_disk) {
            Storage::disk($document->file_disk)->delete($document->file_path);
        }

        $document->chunks()->delete();
        $document->delete();

        return ApiResponse::success(['message' => 'Document deleted']);
    }
}
