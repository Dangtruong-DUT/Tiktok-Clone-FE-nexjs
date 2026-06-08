<?php

namespace App\Http\Controllers\Api\Post;

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
     * Create a new controller instance.
     *
     * @param  PostService  $postService
     * @param  PostViewService  $postViewService
     */
    public function __construct(
        private readonly PostService $postService,
        private readonly PostViewService $postViewService
    ) {}

    /**
     * Create a new post.
     * @param  CreatePostRequest  $request
     * @return JsonResponse
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
     * @param  UpdatePostRequest  $request
     * @return JsonResponse
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
     * @param  GetPostRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function delete(GetPostRequest $request): \Illuminate\Http\Response
    {
        $this->postService->delete($request->input('post_uuid'));

        return ApiResponse::noContent();
    }

    /**
     * Get post details by uuid.
     * @param  GetPostRequest  $request
     * @return JsonResponse
     */
    public function show(GetPostRequest $request): JsonResponse
    {
        $uuid = $request->input('post_uuid');
        $post = $this->postService->getByUuidOrFail($uuid);

        $this->postViewService->increaseView(
            postId:    $post->id,
            authUserId: auth_user_id(),
            ip:        $request->ip(),
            userAgent: (string) $request->userAgent(),
        );

        return ApiResponse::success(
            data: new PostResource($post),
            message: 'Post retrieved successfully'
        );
    }

    /**
     * Get list of posts.
     * @param  GetListPostRequest  $request
     * @return JsonResponse
     */
    public function index(GetListPostRequest $request): JsonResponse
    {
        $posts = $this->postService->search($request->validated());

        return ApiResponse::success(
            data: PostResource::collection($posts),
            message: 'Posts retrieved successfully'
        );
    }

    /**
     * Get friends posts.
     * @param  GetFriendPostsRequest  $request
     * @return JsonResponse
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
     * @param  GetFollowingPostsRequest  $request
     * @return JsonResponse
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
     * @param  GetListChildrenPostRequest  $request
     * @return JsonResponse
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
     * @param  GetRelatedPostsRequest  $request
     * @return JsonResponse
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
     * @param  LikePostRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function like(LikePostRequest $request): \Illuminate\Http\Response
    {
        $this->postService->like($request->input('post_uuid'));

        return ApiResponse::noContent();
    }

    /**
     * Unlike a post.
     * @param  UnlikePostRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function unlike(UnlikePostRequest $request): \Illuminate\Http\Response
    {
        $this->postService->unlike($request->input('post_uuid'));

        return ApiResponse::noContent();
    }

    /**
     * Unbookmark a post.
     * @param  UnBookmarkPostRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function unbookmark(UnBookmarkPostRequest $request): \Illuminate\Http\Response
    {
        $this->postService->unbookmark($request->input('post_uuid'));

        return ApiResponse::noContent();
    }

    /**
     * Bookmark a post.
     * @param  BookmarkPostRequest  $request
     * @return \Illuminate\Http\Response
     */
    public function bookmark(BookmarkPostRequest $request): \Illuminate\Http\Response
    {
        $this->postService->bookmark($request->input('post_uuid'));

        return ApiResponse::noContent();
    }

    /**
     * Get posts of a user by user uuid.
     * @param  GetPostsOfUserRequest  $request
     * @return JsonResponse
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
     * @param  GetLikedPostsOfUserRequest  $request
     * @return JsonResponse
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
     * @param  GetBookmarkedPostsOfUserRequest  $request
     * @return JsonResponse
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
