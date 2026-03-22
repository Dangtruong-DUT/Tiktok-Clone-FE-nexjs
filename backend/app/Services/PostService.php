<?php

namespace App\Services;

use App\Enums\Post\PostTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\NotFoundException;
use App\Models\Post;
use App\Repositories\HashtagRepository;
use App\Repositories\MediaRepository;
use App\Repositories\PostRepository;
use App\Repositories\UserRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PostService
{
    use HasAuthUser;
    /**
     * PostService constructor.
     */
    public function __construct(
        private readonly UserRepository $userRepo,
        private readonly PostRepository $postRepo,
        private readonly MediaRepository $mediaRepo,
        private readonly HashtagRepository $hashtagRepo
    ) {}

    /**
     * Create a new post.
     * @param array $payload
     * @return Post
     */
    public function create(array $payload): Post
    {

        $postType = $payload['type'] ?? PostTypeEnum::POST->value;

        if ($postType !== PostTypeEnum::POST->value && empty($payload['parent_id'])) {
            throw new BusinessException('Parent ID is required for this post type.',[
                'type' => 'Parent ID is required for this post type.',
            ]);
        }

        if ($postType === PostTypeEnum::POST->value && !empty($payload['parent_id'])) {
            throw new BusinessException('Parent ID is not allowed for this post type.',[
                'type' => 'Parent ID is not allowed for this post type.',
            ]);
        }

        $user = $this->guard()->user();
        $post = DB::transaction(function () use ($payload, $postType, $user): Post {
            $parentPost = null;

            if (!empty($payload['parent_id'])) {
                $parentPost = $this->postRepo->findById($payload['parent_id']);
                if (empty($parentPost)) {
                    throw new NotFoundException('Parent post not found');
                }

                if ($postType === PostTypeEnum::RE_POST->value) {
                    $parentPost->increment('repost_count');
                } else if ($postType === PostTypeEnum::QUOTE_POST->value) {
                    $parentPost->increment('quote_post_count');
                } else if ($postType === PostTypeEnum::COMMENT->value) {
                    $parentPost->increment('comments_count');
                }
            }

            $post = $this->postRepo->create([
                'type' => $postType,
                'audience' => $payload['audience'],
                'content' => $payload['content'],
                'thumbnail_file_id' => $payload['thumbnail'] ?? null,
                'user_id' => $user->id,
                'parent_id' => $payload['parent_id'] ?? null,
            ]);
            if (!empty($payload['mentions'])) {
                $post->mentions()->sync($payload['mentions']);
            }
            if (!empty($payload['hashtags'])) {
                $hashtagNames = array_unique($payload['hashtags']);
                $existingHashtags = $this->hashtagRepo->getByNames($hashtagNames);
                $hashtagIdByName = [];

                foreach ($existingHashtags as $hashtag) {
                    $hashtagIdByName[$hashtag->name] = $hashtag->id;
                }

                $newHashtags = [];
                foreach ($hashtagNames as $hashtagName) {
                    if (!isset($hashtagIdByName[$hashtagName])) {
                        $newHashtags[] = ['name' => $hashtagName];
                    }
                }

                if (!empty($newHashtags)) {
                    $this->hashtagRepo->createMany($newHashtags);
                }

                $hashtagIds = $this->hashtagRepo->getByNames($hashtagNames)->pluck('id')->toArray();
                $post->hashtags()->sync($hashtagIds);
            }

            if (!empty($payload['medias'])) {
                $this->mediaRepo->createMany($payload['medias'], $post->id);
            }

            return $post;
        });

        return $this->postRepo->getByIdWithDetail($post->id, $user->id);
    }

    /**
     * Get post by uuid.
     * @param string $uuid
     * @return Post
     */
    public function getByUuid(string $uuid): ?Post
    {
        $userId = $this->guard()->check() ? $this->guard()->id() : null;
        $postDetail = $this->postRepo->getByUuidWithDetail($uuid, $userId);
        if (empty($postDetail)) {
            throw new NotFoundException('Post not found');
        }
        return $postDetail;
    }

    /**
     * Get list of child posts by parent post uuid.
      * @param array $payload
     *                      - post_uuid: parent post uuid
     *                      - audience: filter by audience
     *                      - type: filter by post type
     *                      - q: search keyword for content and user name
     *                      - page: pagination page number
     *                      - per_page: number of items per page for pagination
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getChildren(array $payload): LengthAwarePaginator
    {
        $postUuid = $payload['post_uuid'];
        $post = $this->postRepo->findByUuid($postUuid);
        if (empty($post)) {
            throw new NotFoundException('Post not found');
        }
        $authUserId = $this->guard()->check() ? $this->guard()->id() : null;

        return $this->postRepo->search([
            'q' => $payload['q'] ?? null,
            'audience' => $payload['audience'] ?? null,
            'type' => $payload['post_type'] ?? null,
            'parent_id' => $post->id,
            'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
            'page' => $payload['page'] ?? config('const.pagination.default_page'),
        ], $authUserId);
    }

    /**
     * Search for posts.
      * @param array $payload
     *                      - q: search keyword for content and user name
     *                      - audience: filter by audience
     *                      - type: filter by post type
     *                      - page: pagination page number
     *                      - per_page: number of items per page for pagination
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function search(array $payload): LengthAwarePaginator
    {
        $authUserId = $this->guard()->check() ? $this->guard()->id() : null;

        return $this->postRepo->search([
            'q' => $payload['q'] ?? null,
            'audience' => $payload['audience'] ?? null,
            'type' => $payload['post_type'] ?? null,
            'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
            'page' => $payload['page'] ?? config('const.pagination.default_page'),
        ], $authUserId);
    }

    /**
     * Get posts of a user by user uuid.
      * @param array $payload
     *                      - user_uuid: user uuid
     *                      - type: filter by post type
     *                      - page: pagination page number
     *                      - per_page: number of items per page for pagination
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getByUser(array $payload): LengthAwarePaginator
    {
        $authUserId = $this->guard()->check() ? $this->guard()->id() : null;
        $targetUser = $this->userRepo->findByUuidOrFail($payload['user_uuid']);
        return $this->postRepo->getPostsByUserId(
            filters: [
                'type' => $payload['post_type'] ?? null,
                'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
            ],
            targetUserId: $targetUser->id,
            authUserId: $authUserId
        );
    }

    /**
     * Get liked posts of a user by user uuid.
      * @param array $payload
     *                      - user_uuid: user uuid
     *                      - type: filter by post type
     *                      - page: pagination page number
     *                      - per_page: number of items per page for pagination
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getLikedByUser(array $payload): LengthAwarePaginator
    {
        $authUserId = $this->guard()->check() ? $this->guard()->id() : null;
        $targetUser = $this->userRepo->findByUuidOrFail($payload['user_uuid']);
        return $this->postRepo->getLikedPostsByUserId(
            filters: [
                'type' => $payload['post_type'] ?? null,
                'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
            ],
            targetUserId: $targetUser->id,
            authUserId: $authUserId
        );
    }


    /**
     * Get bookmarked posts of a user by user uuid.
      * @param array $payload
     *                      - user_uuid: user uuid
     *                      - type: filter by post type
     *                      - page: pagination page number
     *                      - per_page: number of items per page for pagination
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getBookmarkedByUser(array $payload): LengthAwarePaginator
    {
        $authUserId = $this->guard()->check() ? $this->guard()->id() : null;
        $targetUser = $this->userRepo->findByUuidOrFail($payload['user_uuid']);
        return $this->postRepo->getBookmarkedPostsByUserId(
            filters: [
                'type' => $payload['post_type'] ?? null,
                'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
            ],
            targetUserId: $targetUser->id,
            authUserId: $authUserId
        );
    }

    /**
     * Like a post.
     * @param string $uuid
     * @return void
     */
    public function like(string $uuid): void
    {
        DB::transaction(function () use ($uuid) {
            $post = $this->postRepo->findByUuid($uuid);
            if (empty($post)) {
                throw new NotFoundException('Post not found');
            }
            if ($post->userLikes()->where('user_id', $this->guard()->id())->exists()) {
                return;
            }
            $post->userLikes()->syncWithoutDetaching([$this->guard()->id()]);
            $post->increment('likes_count');
        });
    }

    /**
     * Unlike a post.
     * @param string $uuid
     * @return void
     */
    public function unlike(string $uuid): void
    {
        DB::transaction(function () use ($uuid) {
            $post = $this->postRepo->findByUuid($uuid);
            if (empty($post)) {
                throw new NotFoundException('Post not found');
            }

            if (!$post->userLikes()->where('user_id', $this->guard()->id())->exists()) {
                return;
            }
            $post->userLikes()->detach($this->guard()->id());
            $post->decrement('likes_count');
        });
    }

    /**
     * Bookmark a post.
     * @param string $uuid
     * @return void
     */
    public function bookmark(string $uuid): void
    {
        DB::transaction(function () use ($uuid) {
            $post = $this->postRepo->findByUuid($uuid);
            if (empty($post)) {
                throw new NotFoundException('Post not found');
            }

            if ($post->userBookmarks()->where('user_id', $this->guard()->id())->exists()) {
                return;
            }
            $post->userBookmarks()->syncWithoutDetaching([$this->guard()->id()]);
            $post->increment('bookmarks_count');
        });
    }

    /**
     * Unbookmark a post.
     * @param string $uuid
     * @return void
     */
    public function unbookmark(string $uuid): void
    {
        DB::transaction(function () use ($uuid) {
            $post = $this->postRepo->findByUuid($uuid);
            if (empty($post)) {
                throw new NotFoundException('Post not found');
            }

            if (!$post->userBookmarks()->where('user_id', $this->guard()->id())->exists()) {
                return;
            }
            $post->userBookmarks()->detach($this->guard()->id());
            $post->decrement('bookmarks_count');
        });
    }
}
