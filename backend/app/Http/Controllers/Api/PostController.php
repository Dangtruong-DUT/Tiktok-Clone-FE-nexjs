<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Post\CreatePostRequest;
use App\Http\Requests\Post\GetPostRequest;
use App\Http\Resources\Api\Post\PostResource;
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
     * @param CreatePostRequest $request
     * @return JsonResponse
     */
    public function create(CreatePostRequest $request): JsonResponse
    {
        $post = $this->postService->createPost($request->validated());
        return ApiResponse::created(
            data: new PostResource($post),
            message: 'Post created successfully'
        );
    }

    /**
     * Get post details by uuid.
     * @param GetPostRequest $request
     * @return JsonResponse
     */
    public function show(GetPostRequest $request): JsonResponse
    {
        $uuid = $request->input('post_uuid');
        $post = $this->postService->getPostByUuid($uuid);
        return ApiResponse::success(
            data: new PostResource($post),
            message: 'Post retrieved successfully'
        );
    }
}
