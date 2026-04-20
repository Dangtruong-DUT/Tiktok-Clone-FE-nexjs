<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Post\DeletePostRequest;
use App\Http\Requests\Admin\Post\GetAdminPostsRequest;
use App\Http\Requests\Admin\Post\HidePostRequest;
use App\Http\Requests\Admin\Post\UnhidePostRequest;
use App\Http\Resources\Api\Admin\Post\AdminPostResource;
use App\Http\Response\ApiResponse;
use App\Services\Admin\PostAdminService;
use Illuminate\Http\JsonResponse;

/**
 * Post admin operations controller.
 */
class PostAdminController extends Controller
{
    /**
     * PostAdminController constructor.
     */
    public function __construct(
        private readonly PostAdminService $postAdminService,
    ) {}

    /**
     * Get paginated list of posts with filtering.
     * @param GetAdminPostsRequest $request
     * @return JsonResponse
     */
    public function getPosts(GetAdminPostsRequest $request): JsonResponse
    {
        $posts = $this->postAdminService->getPosts($request->validated());

        return ApiResponse::success(
            data: AdminPostResource::collection($posts),
            message: 'Posts retrieved successfully'
        );
    }

    /**
     * Hide a post from public view.
     * @param HidePostRequest $request
     * @return JsonResponse
     */
    public function hidePost(HidePostRequest $request): JsonResponse
    {
        $post = $this->postAdminService->hidePost($request->validated());

        return ApiResponse::success(
            data: AdminPostResource::make($post),
            message: 'Post hidden successfully'
        );
    }

    /**
     * Unhide a post.
     * @param UnhidePostRequest $request
     * @return JsonResponse
     */
    public function unhidePost(UnhidePostRequest $request): JsonResponse
    {
        $post = $this->postAdminService->unhidePost($request->validated());

        return ApiResponse::success(
            data: AdminPostResource::make($post),
            message: 'Post unhidden successfully'
        );
    }

    /**
     * Delete a post permanently.
     * @param DeletePostRequest $request
     * @return JsonResponse
     */
    public function deletePost(DeletePostRequest $request): JsonResponse
    {
        $this->postAdminService->deletePost($request->validated());

        return ApiResponse::success(message: 'Post deleted successfully');
    }
}
