<?php

namespace App\Http\Controllers\Api\Admin;

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
     * @param  AiKnowledgeAdminService  $service
     */
    public function __construct(
        private readonly AiKnowledgeAdminService $service,
    ) {}

    /**
     * Retrieve paginated AI knowledge documents.
     *
     * @param  GetAiDocumentsRequest  $request
     * @return JsonResponse
     */
    public function indexDocuments(GetAiDocumentsRequest $request): JsonResponse
    {
        $documents = $this->service->listDocuments($request->validated());

        return ApiResponse::success(AiDocumentAdminResource::collection($documents));
    }

    /**
     * Upload a new AI knowledge document or raw content.
     *
     * @param  UploadAiDocumentRequest  $request
     * @return JsonResponse
     */
    public function uploadDocument(UploadAiDocumentRequest $request): JsonResponse
    {
        $document = $this->service->uploadDocument($request->validated(), $request->file('file'));

        return ApiResponse::success(new AiDocumentAdminResource($document), 201);
    }

    /**
     * Retrieve a single AI knowledge document.
     *
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function showDocument(string $uuid): JsonResponse
    {
        $document = $this->service->getDocument($uuid);

        return ApiResponse::success(new AiDocumentDetailAdminResource($document));
    }

    /**
     * Delete an AI knowledge document and its indexed chunks.
     *
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function destroyDocument(string $uuid): JsonResponse
    {
        $this->service->destroyDocument($uuid);

        return ApiResponse::success(['message' => 'Document deleted']);
    }
}
