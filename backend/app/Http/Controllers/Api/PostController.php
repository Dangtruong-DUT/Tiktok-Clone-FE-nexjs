<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Post\BookmarkPostRequest;
use App\Http\Requests\Post\CreatePostRequest;
use App\Http\Requests\Post\GetBookmarkedPostsOfUserRequest;
use App\Http\Requests\Post\GetFollowingPostsRequest;
use App\Http\Requests\Post\GetFriendPostsRequest;
use App\Http\Requests\Post\GetLikedPostsOfUserRequest;
use App\Http\Requests\Post\GetListChildrenPostRequest;
use App\Http\Requests\Post\GetListPostRequest;
use App\Http\Requests\Post\GetPostRequest;
use App\Http\Requests\Post\GetPostsOfUserRequest;
use App\Http\Requests\Post\GetRelatedPostsRequest;
use App\Http\Requests\Post\LikePostRequest;
use App\Http\Requests\Post\UnBookmarkPostRequest;
use App\Http\Requests\Post\UnlikePostRequest;
use App\Http\Requests\Post\UpdatePostRequest;
use App\Http\Resources\Api\Post\PostResource;
use App\Http\Response\ApiResponse;
use App\Services\PostService;
use App\Services\PostViewService;
use Illuminate\Http\JsonResponse;

class PostController extends Controller
{
    /**
     * PostController constructor.
 */
    public function __construct(
        private readonly PostService $postService,
        private readonly PostViewService $postViewService
    ) {}

    /**
     * Create a new post.
 */
    public function create(CreatePostRequest $request): JsonResponse
    {
        $post = $this->postService->create($request->validated());

        return ApiResponse::created(
            data: new PostResource($post),
            message: 'Post created successfully'
        );
    }

    /**
     * Update a post by uuid.
 */
    public function update(UpdatePostRequest $request): JsonResponse
    {
        $post = $this->postService->update($request->validated());

        return ApiResponse::success(
            data: new PostResource($post),
            message: 'Post updated successfully'
        );
    }

    /**
     * Delete a post by uuid.
 */
    public function delete(GetPostRequest $request): JsonResponse
    {
        $this->postService->delete($request->input('post_uuid'));

        return ApiResponse::success(message: 'Post deleted successfully');
    }

    /**
     * Get post details by uuid.
 */
    public function show(GetPostRequest $request): JsonResponse
    {
        $uuid = $request->input('post_uuid');
        $post = $this->postService->getByUuidOrFail($uuid);

        $viewerFingerprint = implode('|', [
            $request->ip(),
            (string) $request->userAgent(),
        ]);

        $this->postViewService->increaseView(
            postId: $post->id,
            authUserId: auth('api')->id(),
            viewerFingerprint: $viewerFingerprint
        );

        return ApiResponse::success(
            data: new PostResource($post),
            message: 'Post retrieved successfully'
        );
    }

    /**
     * Get list of posts.
 */
    public function index(GetListPostRequest $request): JsonResponse
    {
        $params = array_merge(
            $request->validated()
        );
        $posts = $this->postService->search($params);

        return ApiResponse::success(
            data: PostResource::collection($posts),
            message: 'Posts retrieved successfully'
        );
    }

    /**
     * Get friends posts.
 */
    public function showFriendsPosts(GetFriendPostsRequest $request): JsonResponse
    {
        $posts = $this->postService->getMutualFriendsPosts($request->validated());

        return ApiResponse::success(
            data: PostResource::collection($posts),
            message: 'Friends posts retrieved successfully'
        );
    }

    /**
     * Get following posts.
 */
    public function showFollowingPosts(GetFollowingPostsRequest $request): JsonResponse
    {
        $posts = $this->postService->getFollowingPosts($request->validated());

        return ApiResponse::success(
            data: PostResource::collection($posts),
            message: 'Following posts retrieved successfully'
        );
    }

    /**
     * Get list of child posts by parent post uuid.
 */
    public function showChildren(GetListChildrenPostRequest $request): JsonResponse
    {
        $children = $this->postService->getChildren($request->validated());

        return ApiResponse::success(
            data: PostResource::collection($children),
            message: 'Child posts retrieved successfully'
        );
    }

    /**
     * Get related posts by post uuid.
 */
    public function showRelatedPosts(GetRelatedPostsRequest $request): JsonResponse
    {
        $posts = $this->postService->getRelatedPosts($request->validated());

        return ApiResponse::success(
            data: PostResource::collection($posts),
            message: 'Related posts retrieved successfully'
        );
    }

    /**
     * Like a post.
 */
    public function like(LikePostRequest $request): JsonResponse
    {
        $this->postService->like($request->input('post_uuid'));

        return ApiResponse::success(message: 'Post liked successfully');
    }

    /**
     * Unlike a post.
 */
    public function unlike(UnlikePostRequest $request): JsonResponse
    {
        $this->postService->unlike($request->input('post_uuid'));

        return ApiResponse::success(message: 'Post unliked successfully');
    }

    /**
     * Unbookmark a post.
 */
    public function unbookmark(UnBookmarkPostRequest $request): JsonResponse
    {
        $this->postService->unbookmark($request->input('post_uuid'));

        return ApiResponse::success(message: 'Post unbookmarked successfully');
    }

    /**
     * Bookmark a post.
 */
    public function bookmark(BookmarkPostRequest $request): JsonResponse
    {
        $this->postService->bookmark($request->input('post_uuid'));

        return ApiResponse::success(message: 'Post bookmarked successfully');
    }

    /**
     * Get posts of a user by user uuid.
 */
    public function showUserPosts(GetPostsOfUserRequest $request): JsonResponse
    {
        $posts = $this->postService->getUserPosts($request->validated());

        return ApiResponse::success(
            data: PostResource::collection($posts),
            message: 'User posts retrieved successfully'
        );
    }

    /**
     * Get liked posts of a user by user uuid.
 */
    public function showLikedPosts(GetLikedPostsOfUserRequest $request): JsonResponse
    {
        $posts = $this->postService->getUserLikedPosts($request->validated());

        return ApiResponse::success(
            data: PostResource::collection($posts),
            message: 'Liked posts retrieved successfully'
        );
    }

    /**
     * Get bookmarked posts of a user by user uuid.
 */
    public function showBookmarkedPosts(GetBookmarkedPostsOfUserRequest $request): JsonResponse
    {
        $posts = $this->postService->getUserBookmarkedPosts($request->validated());

        return ApiResponse::success(
            data: PostResource::collection($posts),
            message: 'Bookmarked posts retrieved successfully'
        );
    }
}
