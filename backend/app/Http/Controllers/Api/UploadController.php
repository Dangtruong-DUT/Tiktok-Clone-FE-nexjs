<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Upload\UploadImageRequest;
use App\Http\Requests\Upload\UploadVideoRequest;
use App\Http\Response\ApiResponse;
use App\Services\UploadService;
use Illuminate\Http\JsonResponse;

class UploadController extends Controller
{
    public function __construct(
        private readonly UploadService $uploadService
    ) {}

    public function uploadImage(UploadImageRequest $request): JsonResponse
    {
        $data = $this->uploadService->image($request->file('file'));

        return ApiResponse::success($data, 'Image uploaded successfully');
    }

    public function uploadVideo(UploadVideoRequest $request): JsonResponse
    {
        $data = $this->uploadService->video($request->file('file'));

        return ApiResponse::success($data, 'Video uploaded successfully');
    }
}
