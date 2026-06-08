<?php

namespace App\Http\Controllers\Api\Media;

use App\Actions\Video\DeleteVideoUploadAction;
use App\Actions\Video\RetryVideoEncodingAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\Video\VideoEncodingStatusResource;
use App\Http\Response\ApiResponse;
use App\Services\Video\VideoEncodingService;
use Illuminate\Http\JsonResponse;

class VideoStreamController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  VideoEncodingService  $encodingService
     */
    public function __construct(
        private readonly VideoEncodingService $encodingService,
    ) {}

    /**
     * Retrieve the encoding status for an uploaded video.
     *
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function encodingStatus(string $uuid): JsonResponse
    {
        $encoding = $this->encodingService->getEncodingByFileUuid($uuid);

        return ApiResponse::success(
            data:    new VideoEncodingStatusResource($encoding),
            message: 'Encoding status retrieved.',
        );
    }

    /**
     * Retry encoding for a failed upload.
     *
     * @param  string  $uuid
     * @param  RetryVideoEncodingAction  $action
     * @return JsonResponse
     */
    public function retryEncoding(string $uuid, RetryVideoEncodingAction $action): JsonResponse
    {
        $this->encodingService->retryFailedEncoding($uuid, $action);

        return ApiResponse::success(message: 'Encoding job queued.');
    }

    /**
     * Delete a video upload and its encoding artifacts.
     *
     * @param  string  $uuid
     * @param  DeleteVideoUploadAction  $action
     * @return JsonResponse
     */
    public function destroy(string $uuid, DeleteVideoUploadAction $action): JsonResponse
    {
        $this->encodingService->deleteUploadByUuid($uuid, $action);

        return ApiResponse::success(message: 'Upload cancelled.');
    }
}
