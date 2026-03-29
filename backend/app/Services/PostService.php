<?php

namespace App\Services;

use App\Enums\Post\PostTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\ForbiddenException;
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

                $this->updateParentCounter($parentPost, $postType, 'increment');
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
                $this->syncHashtags($post, $payload['hashtags']);
            }

            if (!empty($payload['medias'])) {
                $this->mediaRepo->createMany($payload['medias'], $post->id);
            }

            return $post;
        });

        return $this->postRepo->getByIdWithDetail($post->id, $user->id);
    }

    /**
     * Update a post by uuid.
     * @param array $payload
     *              - post_uuid: post uuid
     *              - content: post content
     *              - audience: post audience
     *              - thumbnail: thumbnail file id
     *              - mentions: array of mentioned user ids
     *              - hashtags: array of hashtag names
     * @return Post
     */
    public function update(array $payload): Post
    {
        $post = $this->findPostOrFail($payload['post_uuid']);

        $authUserId =auth_user_id();
        if ($post->user_id !== $authUserId) {
            throw new ForbiddenException('You can only update your own post');
        }

        $allowedFields = ['content', 'audience', 'thumbnail'];
        $dataToUpdate = array_intersect_key($payload, array_flip($allowedFields));

        if (empty($dataToUpdate) && !array_key_exists('mentions', $payload) && !array_key_exists('hashtags', $payload)) {
            throw new BusinessException('At least one field must be provided for update');
        }

        DB::transaction(function () use ($post, $payload, $dataToUpdate): void {
            if (!empty($dataToUpdate)) {
                $this->postRepo->update($post->id, [
                    'content' => $dataToUpdate['content'] ?? $post->content,
                    'audience' => $dataToUpdate['audience'] ?? $post->audience,
                    'thumbnail_file_id' => array_key_exists('thumbnail', $dataToUpdate)
                        ? $dataToUpdate['thumbnail']
                        : $post->thumbnail_file_id,
                ]);
            }

            if (array_key_exists('mentions', $payload)) {
                $post->mentions()->sync($payload['mentions'] ?? []);
            }

            if (array_key_exists('hashtags', $payload)) {
                $this->syncHashtags($post, $payload['hashtags'] ?? []);
            }
        });

        return $this->postRepo->getByIdWithDetail($post->id, $authUserId);
    }

    /**
     * Delete a post by uuid.
     * @param string $uuid
     * @return void
     */
    public function delete(string $uuid): void
    {
        DB::transaction(function () use ($uuid): void {
            $post = $this->findPostOrFail($uuid);

            if ($post->user_id !== auth_user_id()) {
                throw new ForbiddenException('You can only delete your own post');
            }

            if (!empty($post->parent_id)) {
                $parentPost = $this->postRepo->findById($post->parent_id);

                if (!empty($parentPost)) {
                    $this->updateParentCounter($parentPost, $post->type->value, 'decrement');
                }
            }

            $this->postRepo->delete($post->id);
        });
    }

    /**
     * Get post by uuid.
     * @param string $uuid
     * @return Post
     */
    public function getByUuidOrFail(string $uuid): ?Post
    {
        $userId = auth_user_id();
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
        $post = $this->findPostOrFail($postUuid);
        $authUserId = auth_user_id();

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
        $authUserId = auth_user_id();

        return $this->postRepo->search([
            'q' => $payload['q'] ?? null,
            'audience' => $payload['audience'] ?? null,
            'type' => $payload['post_type'] ?? null,
            'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
            'page' => $payload['page'] ?? config('const.pagination.default_page'),
        ], $authUserId);
    }

    /**
     * Get ports of friends.
      * @param array $payload
     *                      - q: search keyword for content and user name
     *                      - page: pagination page number
     *                      - per_page: number of items per page for pagination
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getMutualFriendsPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        return $this->postRepo->getMutualFriendsPosts(
            filters: [
                'q' => $payload['q'] ?? null,
                'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
                'page' => $payload['page'] ?? config('const.pagination.default_page'),
            ],
            authUserId: $authUserId
        );
    }

    /**
     * Get ports of following users.
      * @param array $payload
     *                      - q: search keyword for content and user name
     *                      - page: pagination page number
     *                      - per_page: number of items per page for pagination
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getFollowingPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        return $this->postRepo->getFollowingPosts(
            filters: [
                'q' => $payload['q'] ?? null,
                'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
                'page' => $payload['page'] ?? config('const.pagination.default_page'),
            ],
            authUserId: $authUserId
        );
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
    public function getUserPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        $targetUser = $this->userRepo->findByUuidOrFail($payload['user_uuid']);
        return $this->postRepo->getPostsByUserId(
            filters: [
                'type' => $payload['post_type'] ?? null,
                'q' => $payload['q'] ?? null,
                'audience' => $payload['audience'] ?? null,
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
    public function getUserLikedPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
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
    public function getUserBookmarkedPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
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
            $post = $this->findPostOrFail($uuid);
            if ($post->userLikes()->where('user_id', auth_user_id())->exists()) {
                return;
            }
            $post->userLikes()->syncWithoutDetaching([auth_user_id()]);
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
            $post = $this->findPostOrFail($uuid);

            if (!$post->userLikes()->where('user_id', auth_user_id())->exists()) {
                return;
            }
            $post->userLikes()->detach(auth_user_id());
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
            $post = $this->findPostOrFail($uuid);

            if ($post->userBookmarks()->where('user_id', auth_user_id())->exists()) {
                return;
            }
            $post->userBookmarks()->syncWithoutDetaching([auth_user_id()]);
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
            $post = $this->findPostOrFail($uuid);

            if (!$post->userBookmarks()->where('user_id', auth_user_id())->exists()) {
                return;
            }
            $post->userBookmarks()->detach(auth_user_id());
            $post->decrement('bookmarks_count');
        });
    }

    /**
     * Find post by uuid or throw not found exception.
     * @param string $uuid
     * @return Post
     */
    private function findPostOrFail(string $uuid): Post
    {
        $post = $this->postRepo->findByUuid($uuid);

        if (empty($post)) {
            throw new NotFoundException('Post not found');
        }

        return $post;
    }

    /**
     * Sync hashtags to post.
     * @param Post $post
     * @param array $hashtagNames
     * @return void
     */
    private function syncHashtags(Post $post, array $hashtagNames): void
    {
        $hashtagNames = array_values(array_unique($hashtagNames));
        $existingHashtags = $this->hashtagRepo->getByNames($hashtagNames)
            ->keyBy('name');
        $newHashtags = [];
        foreach ($hashtagNames as $hashtagName) {
            if (!isset($existingHashtags[$hashtagName])) {
                $newHashtags[] = ['name' => $hashtagName];
            }
        }

        $hashtagIds = [];
        if (!empty($newHashtags)) {
            $this->hashtagRepo->createMany($newHashtags);
            $hashtagIds = $this->hashtagRepo
                        ->getByNames($hashtagNames)
                        ->pluck('id')
                        ->toArray();
        }

        $post->hashtags()->sync($hashtagIds);
    }

    /**
     * Update parent post counter by post type.
     * @param Post $parentPost
     * @param int $type
     * @param string $action
     * @return void
     */
    private function updateParentCounter(Post $parentPost, int $type, string $action = 'increment'): void
    {
        $map = [
            PostTypeEnum::RE_POST->value => 'repost_count',
            PostTypeEnum::QUOTE_POST->value => 'quote_post_count',
            PostTypeEnum::COMMENT->value => 'comments_count',
        ];

        if (!isset($map[$type])) {
            return;
        }

        $field = $map[$type];

        $action === 'increment'
            ? $parentPost->increment($field)
            : $parentPost->decrement($field);
    }
}
