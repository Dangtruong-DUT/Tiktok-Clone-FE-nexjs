<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Post\DeletePostRequest;
use App\Http\Requests\Admin\Post\GetAdminPostsRequest;
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
     * Create a new controller instance.
     *
     * @param  PostAdminService  $postAdminService
     */
    public function __construct(
        private readonly PostAdminService $postAdminService,
    ) {}

    /**
     * Get paginated list of posts with filtering.
     * @param  GetAdminPostsRequest  $request
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
     * Delete a post (soft delete).
     * @param  DeletePostRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function deletePost(DeletePostRequest $request): \Illuminate\Http\Response
    {
        $this->postAdminService->deletePost($request->validated());

        return ApiResponse::noContent();
    }
}
