<?php

namespace App\Http\Controllers\Api\Admin\Ai;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AiKnowledge\GetAiDocumentsRequest;
use App\Http\Requests\Admin\AiKnowledge\UploadAiDocumentRequest;
use App\Http\Resources\Api\Admin\AiDocumentAdminResource;
use App\Http\Resources\Api\Admin\AiDocumentDetailAdminResource;
use App\Http\Response\ApiResponse;
use App\Services\Admin\AiKnowledgeAdminService;
use Illuminate\Http\JsonResponse;

class AiKnowledgeAdminController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  AiKnowledgeAdminService  $aiKnowledgeAdminService
     */
    public function __construct(
        private readonly AiKnowledgeAdminService $aiKnowledgeAdminService,
    ) {}

    /**
     * Retrieve paginated AI knowledge documents.
     *
     * @param  GetAiDocumentsRequest  $request
     * @return JsonResponse
     */
    public function indexDocuments(GetAiDocumentsRequest $request): JsonResponse
    {
        $documents = $this->aiKnowledgeAdminService->listDocuments($request->validated());

        return ApiResponse::success(
            data:    AiDocumentAdminResource::collection($documents),
            message: 'AI knowledge documents retrieved.',
        );
    }

    /**
     * Upload a new AI knowledge document or raw content.
     *
     * @param  UploadAiDocumentRequest  $request
     * @return JsonResponse
     */
    public function uploadDocument(UploadAiDocumentRequest $request): JsonResponse
    {
        $document = $this->aiKnowledgeAdminService->uploadDocument($request->validated(), $request->file('file'));

        return ApiResponse::created(
            data:    new AiDocumentAdminResource($document),
            message: 'Document uploaded.',
        );
    }

    /**
     * Retrieve a single AI knowledge document.
     *
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function showDocument(string $uuid): JsonResponse
    {
        $document = $this->aiKnowledgeAdminService->getDocument($uuid);

        return ApiResponse::success(
            data:    new AiDocumentDetailAdminResource($document),
            message: 'AI knowledge document retrieved.',
        );
    }

    /**
     * Delete an AI knowledge document and its indexed chunks.
     *
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function destroyDocument(string $uuid): JsonResponse
    {
        $this->aiKnowledgeAdminService->destroyDocument($uuid);

        return ApiResponse::noContent();
    }
}
