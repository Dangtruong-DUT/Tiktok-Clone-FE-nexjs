<?php

namespace App\Http\Controllers\Api\Media;

use App\Http\Controllers\Controller;
use App\Http\Requests\Upload\UploadImageRequest;
use App\Http\Requests\Upload\UploadVideoRequest;
use App\Http\Response\ApiResponse;
use App\Services\Upload\UploadService;
use Illuminate\Http\JsonResponse;

class UploadController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  UploadService  $uploadService
     */
    public function __construct(
        private readonly UploadService $uploadService
    ) {}

    /**
     * Upload an image file.
     *
     * @param  UploadImageRequest  $request
     * @return JsonResponse
     */
    public function uploadImage(UploadImageRequest $request): JsonResponse
    {
        $data = $this->uploadService->image($request->file('file'));

        return ApiResponse::success(data: $data, message: 'Image uploaded successfully.');
    }

    /**
     * Upload a video file.
     *
     * @param  UploadVideoRequest  $request
     * @return JsonResponse
     */
    public function uploadVideo(UploadVideoRequest $request): JsonResponse
    {
        $data = $this->uploadService->video($request->file('file'));

        return ApiResponse::success(data: $data, message: 'Video uploaded successfully.');
    }
}
