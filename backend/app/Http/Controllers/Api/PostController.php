<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;

class PostController extends Controller
{
    /**
     * PostController constructor.
     */
    public function __construct(
        private readonly PostService $postService
    )
    {}

    /**
     * Create a new post.
     *
     * @return JsonResponse
     */
    public function create(): JsonResponse
    {
        $data = $this->postService->createPost([]);
        return ApiResponse::success(data: $data, message: 'Post created successfully');
    }
}
