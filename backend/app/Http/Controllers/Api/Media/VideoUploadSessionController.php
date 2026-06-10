<?php

namespace App\Http\Controllers\Api\Media;

use App\Enums\Video\UploadTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\ForbiddenException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Upload\CompleteUploadSessionRequest;
use App\Http\Requests\Upload\InitUploadSessionRequest;
use App\Http\Resources\Api\Upload\VideoUploadSessionResource;
use App\Http\Resources\Api\Upload\VideoUploadStatusResource;
use App\Http\Response\ApiResponse;
use App\Services\Upload\VideoUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class VideoUploadSessionController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  VideoUploadService  $uploadService
     */
    public function __construct(
        private readonly VideoUploadService $uploadService,
    ) {}

    /**
     * Initialize a new upload session and return presigned upload credentials.
     *
     * @param  InitUploadSessionRequest  $request
     * @return JsonResponse
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
            data:    new VideoUploadSessionResource($session, $presignedUrl),
            message: 'Upload session created.',
        );
    }

    /**
     * Generate a presigned URL for uploading a single part of a multipart upload.
     *
     * @param  string  $session
     * @param  int  $partNumber
     * @return JsonResponse
     * @throws ForbiddenException
     * @throws BusinessException
     */
    public function getPartUrl(string $session, int $partNumber): JsonResponse
    {
        $part = $this->uploadService->getPartUrlByUuid($session, (int) auth_user_id(), $partNumber);

        return ApiResponse::success(
            data: [
                'presigned_url' => $part->url,
                'part_number'   => $part->partNumber,
            ],
            message: 'Part URL generated.',
        );
    }

    /**
     * Complete an upload session and queue processing.
     *
     * @param  CompleteUploadSessionRequest  $request
     * @param  string  $session
     * @return JsonResponse
     * @throws ForbiddenException
     */
    public function complete(CompleteUploadSessionRequest $request, string $session): JsonResponse
    {
        $session = $this->uploadService->completeSessionByUuid(
            $session,
            (int) auth_user_id(),
            $request->validated(),
        );

        return ApiResponse::success(
            data:    new VideoUploadStatusResource($session),
            message: 'Upload completed.',
        );
    }

    /**
     * Return the current status and encoding progress of an upload session.
     *
     * @param  string  $session
     * @return JsonResponse
     * @throws ForbiddenException
     */
    public function status(string $session): JsonResponse
    {
        return ApiResponse::success(
            data:    new VideoUploadStatusResource(
                $this->uploadService->getOwnedSessionByUuid($session, (int) auth_user_id())
            ),
            message: 'Upload status retrieved.',
        );
    }

    /**
     * Abort an upload session, cleaning up any stored objects and encoding jobs.
     *
     * @param  string  $session
     * @return Response
     * @throws ForbiddenException
     */
    public function abort(string $session): Response
    {
        $this->uploadService->abortSessionByUuid($session, (int) auth_user_id());

        return ApiResponse::noContent();
    }
}
