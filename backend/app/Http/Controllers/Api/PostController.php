<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Post\BookmarkPostRequest;
use App\Http\Requests\Post\CreatePostRequest;
use App\Http\Requests\Post\GetListChildrenPostRequest;
use App\Http\Requests\Post\GetPostRequest;
use App\Http\Requests\Post\LikePostRequest;
use App\Http\Requests\Post\UnBookmarkPostRequest;
use App\Http\Requests\Post\UnlikePostRequest;
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

    /**
     * Get list of child posts by parent post uuid.
     * @param GetListChildrenPostRequest $request
     * @return JsonResponse
     */
    public function showChildren(GetListChildrenPostRequest $request): JsonResponse
    {
        $children = $this->postService->getChildrenPosts($request->validated());
        return ApiResponse::success(
            data: PostResource::collection($children),
            message: 'Child posts retrieved successfully'
        );
    }

    /**
     * Like a post.
     * @param LikePostRequest $request
     * @return JsonResponse
     */
    public function like(LikePostRequest $request): JsonResponse
    {
        $this->postService->likePost($request->input('post_uuid'));
        return ApiResponse::success(message: 'Post liked successfully');
    }

    /**
     * Unlike a post.
     * @param UnlikePostRequest $request
     * @return JsonResponse
     */
    public function unlike(UnlikePostRequest $request): JsonResponse
    {
        $this->postService->unlikePost($request->input('post_uuid'));
        return ApiResponse::success(message: 'Post unliked successfully');
    }

    /**
     * Unbookmark a post.
     * @param UnBookmarkPostRequest $request
     * @return JsonResponse
     */
    public function unbookmark(UnBookmarkPostRequest $request): JsonResponse
    {
        $this->postService->unbookmarkPost($request->input('post_uuid'));
        return ApiResponse::success(message: 'Post unbookmarked successfully');
    }

    /**
     * Bookmark a post.
     * @param BookmarkPostRequest $request
     * @return JsonResponse
     */
    public function bookmark(BookmarkPostRequest $request): JsonResponse
    {
        $this->postService->bookmarkPost($request->input('post_uuid'));
        return ApiResponse::success(message: 'Post bookmarked successfully');
    }
}
