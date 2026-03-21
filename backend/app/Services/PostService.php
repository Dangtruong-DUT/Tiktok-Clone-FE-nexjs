<?php

namespace App\Services;

use App\Enums\Post\PostTypeEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\NotFoundException;
use App\Models\Post;
use App\Repositories\HashTagRepository;
use App\Repositories\MediaRepository;
use App\Repositories\PostRepository;
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
        private readonly PostRepository $postRepo,
        private readonly MediaRepository $mediaRepo,
        private readonly HashTagRepository $hashTagRepo
    ) {}

    /**
     * Create a new post.
     * @param array $data
     * @return Post
     */
    public function createPost(array $data) : Post
    {

        $postType = $data['type']??PostTypeEnum::POST->value;

        if ($postType !== PostTypeEnum::POST->value && empty($data['parent_id'])) {
            throw new BusinessException('Parent ID is required for this post type.',[
                'type' => 'Parent ID is required for this post type.',
            ]);
        }

        if ($postType == PostTypeEnum::POST->value && !empty($data['parent_id'])) {
            throw new BusinessException('Parent ID is not allowed for this post type.',[
                'type' => 'Parent ID is not allowed for this post type.',
            ]);
        }

        $user = $this->guard()->user();
        $post = DB::transaction(function () use ($data, $postType, $user): Post {
            $post = $this->postRepo->create([
                'type' => $postType,
                'audience' => $data['audience'],
                'content' => $data['content'],
                'thumbnail_file_id' => $data['thumbnail'] ?? null,
                'user_id' => $user->id,
                'parent_id' => $data['parent_id'] ?? null,
            ]);
            if (!empty($data['mentions'])) {
                $post->mentions()->sync($data['mentions']);
            }
            if (!empty($data['hashtags'])) {
                $names = array_unique($data['hashtags']);
                $existing = $this->hashTagRepo->getByNames($names);
                $map = [];

                foreach ($existing as $tag) {
                    $map[$tag->name] = $tag->id;
                }

                $new = [];
                foreach ($names as $name) {
                    if (!isset($map[$name])) {
                        $new[] = ['name' => $name];
                    }
                }

                if (!empty($new)) {
                    $this->hashTagRepo->createMany($new);
                }

                $ids = $this->hashTagRepo->getByNames($names)->pluck('id')->toArray();
                $post->hashtags()->sync($ids);
            }

            if (!empty($data['medias'])) {
                $this->mediaRepo->createMany($data['medias'], $post->id);
            }
            return $post;
        });

        $postDetail= $this->postRepo->getByIdWithDetail($post->id, $user->id);
        return $postDetail;
    }

    /**
     * Get post by uuid.
     * @param string $uuid
     * @return Post
     */
    public function getPostByUuid(string $uuid): ?Post
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
     * @param array $data
     *                      - post_uuid: parent post uuid
     *                      - audience: filter by audience
     *                      - type: filter by post type
     *                      - q: search keyword for content and user name
     *                      - page: pagination page number
     *                      - per_page: number of items per page for pagination
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getChildrenPosts(array $data): LengthAwarePaginator
    {
        $uuid = $data['post_uuid'];
        $post = $this->postRepo->findByUuid($uuid);
        if (empty($post)) {
            throw new NotFoundException('Post not found');
        }
        $authUserId = $this->guard()->check() ? $this->guard()->id() : null;

        return $this->postRepo->search([
            'q' => $data['q'] ?? null,
            'audience' => $data['audience'] ?? null,
            'type' => $data['post_type'] ?? null,
            'parent_id' => $post->id,
            'per_page' => $data['per_page'] ?? config('const.pagination.default_per_page'),
            'page' => $data['page'] ?? config('const.pagination.default_page'),
        ], $authUserId);
    }

    /**
     * Search for posts.
     *  @param array $data
     *                      - q: search keyword for content and user name
     *                      - audience: filter by audience
     *                      - type: filter by post type
     *                      - page: pagination page number
     *                      - per_page: number of items per page for pagination
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function searchPosts(array $data): LengthAwarePaginator
    {
        $authUserId = $this->guard()->check() ? $this->guard()->id() : null;

        return $this->postRepo->search([
            'q' => $data['q'] ?? null,
            'audience' => $data['audience'] ?? null,
            'type' => $data['post_type'] ?? null,
            'per_page' => $data['per_page'] ?? config('const.pagination.default_per_page'),
            'page' => $data['page'] ?? config('const.pagination.default_page'),
        ], $authUserId);
    }

    /**
     * Like a post.
     * @param string $uuid
     * @return void
     */
    public function likePost(string $uuid): void
    {
        $post = $this->postRepo->findByUuid($uuid);
        if (empty($post)) {
            throw new NotFoundException('Post not found');
        }
        $post->userLikes()->syncWithoutDetaching([$this->guard()->id()]);
    }

    /**
     * Unlike a post.
     * @param string $uuid
     * @return void
     */
    public function unlikePost(string $uuid): void
    {
        $post = $this->postRepo->findByUuid($uuid);
        if (empty($post)) {
            throw new NotFoundException('Post not found');
        }
        $post->userLikes()->detach($this->guard()->id());
    }

    /**
     * Bookmark a post.
     * @param string $uuid
     * @return void
     */
    public function bookmarkPost(string $uuid): void
    {
        $post = $this->postRepo->findByUuid($uuid);
        if (empty($post)) {
            throw new NotFoundException('Post not found');
        }
        $post->userBookmarks()->syncWithoutDetaching([$this->guard()->id()]);
    }

    /**
     * Unbookmark a post.
     * @param string $uuid
     * @return void
     */
    public function unbookmarkPost(string $uuid): void
    {
        $post = $this->postRepo->findByUuid($uuid);
        if (empty($post)) {
            throw new NotFoundException('Post not found');
        }
        $post->userBookmarks()->detach($this->guard()->id());
    }
}
