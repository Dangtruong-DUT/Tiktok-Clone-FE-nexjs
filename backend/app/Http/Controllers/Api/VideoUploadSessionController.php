<?php

namespace App\Http\Controllers\Api;

use App\Enums\Video\UploadTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\ForbiddenException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Upload\CompleteUploadSessionRequest;
use App\Http\Requests\Upload\InitUploadSessionRequest;
use App\Http\Resources\Api\Upload\VideoUploadSessionResource;
use App\Http\Resources\Api\Upload\VideoUploadStatusResource;
use App\Http\Response\ApiResponse;
use App\Models\VideoUploadSession;
use App\Services\Upload\VideoUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class VideoUploadSessionController extends Controller
{
    public function __construct(
        private readonly VideoUploadService $uploadService,
    ) {}

    /**
     * Initialize a new upload session and return presigned upload credentials.
     */
    public function init(InitUploadSessionRequest $request): JsonResponse
    {
        ['session' => $session, 'presigned_url' => $presignedUrl] = $this->uploadService->initSession(
            user: $request->user(),
            fileName: $request->string('file_name')->toString(),
            fileSize: $request->integer('file_size'),
            mimeType: $request->string('mime_type')->toString(),
        );

        return ApiResponse::created(
            new VideoUploadSessionResource($session, $presignedUrl),
            'Upload session created'
        );
    }

    /**
     * Generate a presigned URL for uploading a single part of a multipart upload.
     *
     * @throws ForbiddenException
     * @throws BusinessException
     */
    public function getPartUrl(VideoUploadSession $session, int $partNumber): JsonResponse
    {
        $this->authorizeSession($session);

        if ($session->upload_type !== UploadTypeEnum::MULTIPART) {
            throw new BusinessException('This session is not a multipart upload.');
        }

        $part = $this->uploadService->getPartUrl($session, $partNumber);

        return ApiResponse::success([
            'presigned_url' => $part->url,
            'part_number'   => $part->partNumber,
        ]);
    }

    /**
     * Complete an upload session, verify the object on storage, and queue processing.
     *
     * @throws ForbiddenException
     */
    public function complete(CompleteUploadSessionRequest $request, VideoUploadSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        $session = $this->uploadService->completeSession($session, $request->resolvedParts());

        return ApiResponse::success(
            new VideoUploadStatusResource($session),
            'Upload completed'
        );
    }

    /**
     * Return the current status and encoding progress of an upload session.
     *
     * @throws ForbiddenException
     */
    public function status(VideoUploadSession $session): JsonResponse
    {
        $this->authorizeSession($session);

        return ApiResponse::success(new VideoUploadStatusResource($session));
    }

    /**
     * Abort an upload session, cleaning up any stored objects and encoding jobs.
     *
     * @throws ForbiddenException
     */
    public function abort(VideoUploadSession $session): Response
    {
        $this->authorizeSession($session);

        $this->uploadService->abortSession($session);

        return ApiResponse::noContent();
    }

    /**
     * @throws ForbiddenException
     */
    private function authorizeSession(VideoUploadSession $session): void
    {
        if (! $session->isOwnedBy(auth_user_id())) {
            throw new ForbiddenException('You do not have permission to access this upload session.');
        }
    }
}
