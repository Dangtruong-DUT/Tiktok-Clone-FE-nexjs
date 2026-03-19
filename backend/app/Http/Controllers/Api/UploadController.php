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
    /**
     * UploadController constructor.
     */
    public function __construct(
        private readonly UploadService $uploadService
    )
    {
    }

    /**
     * handle image upload
     *
     * @param UploadImageRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadImage(UploadImageRequest $request): JsonResponse
    {
        $data = $this->uploadService->uploadImage($request->file('file'));
        return ApiResponse::success($data, 'Image uploaded successfully');
    }

    /**
     * handle video upload
     *
     * @param UploadVideoRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadVideo(UploadVideoRequest $request): JsonResponse
    {
        $data = $this->uploadService->uploadVideo($request->file('file'));
        return ApiResponse::success($data, 'Video uploaded successfully');
    }
}
