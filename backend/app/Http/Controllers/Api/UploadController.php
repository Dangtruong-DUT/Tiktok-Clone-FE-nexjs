<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Upload\UploadImageRequest;
use App\Http\Requests\Upload\UploadVideoRequest;
use App\Http\Response\ApiResponse;
use Illuminate\Http\JsonResponse;

class UploadController extends Controller
{
    /**
     * handle image upload
     *
     * @param UploadImageRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadImage(UploadImageRequest $request): JsonResponse
    {
        return ApiResponse::success(null, 'Image uploaded successfully');
    }

    public function uploadVideo(UploadVideoRequest $request): JsonResponse
    {
        return ApiResponse::success(null, 'Video uploaded successfully');
    }
}