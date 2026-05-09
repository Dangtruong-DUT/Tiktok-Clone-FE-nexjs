<?php

namespace App\Repositories;

use App\Enums\Post\PostTypeEnum;
use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Collection;

class PostRepository extends BaseRepository
{
    /**
     * PostRepository constructor.
     */
    public function __construct()
    {
        parent::__construct(app()->make(Post::class));
    }

    /**
     * Increment user_views and guest_views for a post by given amounts.
     * @param int $postId
     * @param int $userViews
     * @param int $guestViews
     * @return bool True if the update was successful, false otherwise.
     */
    public function incrementViews(int $postId, int $userViews, int $guestViews): bool
    {
        $post = $this->query()->whereKey($postId)->first();

        if ($post === null) {
            return false;
        }

        $post->user_views += $userViews;
        $post->guest_views += $guestViews;

        return $post->save();
    }

    /**
     * Check if a post exists by id.
     * @param int $id
     * @return bool
     */
    public function isExist(int $id): bool
    {
        return $this->query()->whereKey($id)->exists();
    }

    /**
     * Check if a post exists by uuid.
     * @param string $uuid
     * @return bool
     */
    public function isExistByUuid(string $uuid): bool
    {
        return $this->query()->where('uuid', $uuid)->exists();
    }

    /**
     * Find a post by id.
     * @param int $id
     * @return Post|null
     */
    public function findById(int $id): ?Post
    {
        return $this->query()->whereKey($id)->first();
    }

    /**
     * Get post with details by id.
     * @param int $id
     * @return Post|null
     */
    public function getByIdWithDetail(int $id, ?int $userId): ?Post
    {
        $query = $this->query()->whereKey($id);

        return $this->withDetail($query, $userId)->first();
    }

    /**
     * Get post with details by uuid.
     * @param string  $uuid
     * @param int|null $userId
     * @return Post|null
     */
    public function getByUuidWithDetail(string $uuid, ?int $userId): ?Post
    {
        $query = $this->query()->where('uuid', $uuid);

        return $this->withDetail($query, $userId)->first();
    }

    /**
     * Find a post by its UUID.
     * @param string  $uuid
     * @return Post|null
     */
    public function findByUuid(string $uuid): ?Post
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    /**
     * Find a post by its UUID or throw an exception if not found.
     * @param string  $uuid
     * @return Post
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findByUuidOrFail(string $uuid): Post
    {
        return $this->query()->where('uuid', $uuid)->firstOrFail();
    }

    /**
     * Find a post by ID, including soft-deleted posts.
     * @param  int  $id
     * @return Post|null
     */
    public function findWithTrashedById(int $id): ?Post
    {
        return $this->query()->withTrashed()->whereKey($id)->first();
    }

    /**
     * Restore a soft-deleted post by ID.
     * @return bool True if the post was restored, false otherwise.
     */
    public function restoreById(int $id): bool
    {
        return (bool) $this->query()->withTrashed()->whereKey($id)->restore();
    }

    /**
     * Get paginated list of posts for admin view with filters.
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function searchPostsForAdmin(array $filters): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $query = $this->buildSearchQuery($filterCollection);

        if ($filterCollection->get('status') === 'deleted') {
            $query->withTrashed();
        }

        $query->when($filterCollection->get('user_uuid'), function (Builder $query, $userUuid) {
            $query->whereHas('user',
                fn (Builder $userQuery) => $userQuery->where('uuid', $userUuid));
        })
            ->when($filterCollection->get('status'), function (Builder $query, $status) {
                return match ($status) {
                    'visible' => $query->whereNull('deleted_at'),
                    'deleted' => $query->whereNotNull('deleted_at'),
                    default => $query,
                };
            })
            ->when($filterCollection->get('order_by'), function (Builder $query, $orderBy) {
                $query->orderByMultiple($orderBy);
            }, function (Builder $query) {
                $query->orderByDesc('created_at');
            });

        $perPage = min((int) $filterCollection->get('per_page', 20), 100);

        return $query
            ->with([
                'user:id,uuid,username,avatar_file_id',
                'user.avatarFile:id',
                'media:id,post_id,type,upload_file_id',
                'media.file:id',
            ])
            ->select(['id', 'uuid', 'user_id', 'content', 'created_at', 'deleted_at','thumbnail_file_id'])
            ->paginate($perPage);
    }

    /**
     * Search comments for admin view with filters.
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     *
     */
    public function searchCommentsForAdmin(array $filters): LengthAwarePaginator
    {
        $filters['type']= PostTypeEnum::COMMENT->value;
        $filterCollection = collect($filters);

        $query = $this->buildSearchQuery($filterCollection)
            ->when($filterCollection->get('post_uuid'), function (Builder $query, $postUuid) {
                $query->whereHas('post', fn (Builder $postQuery) => $postQuery->where('uuid', $postUuid));
            })
            ->when($filterCollection->get('user_uuid'), function (Builder $query, $userUuid) {
                $query->whereHas('user', fn (Builder $userQuery) => $userQuery->where('uuid', $userUuid));
            })
            ->when($filterCollection->get('order_by'), function (Builder $query, $orderBy) {
                $query->orderByMultiple($orderBy);
            }, function (Builder $query) {
                $query->orderByDesc('created_at');
            });

        $perPage = (int) ($filterCollection->get('per_page') ?? config('const.pagination.default_per_page', 10));

        return $query
            ->with([
                'user:id,uuid,username,avatar_file_id',
                'user.avatarFile:id',
                'parent:id,uuid,user_id,content',
                'parent.user:id,uuid,username',
            ])
            ->select(['id', 'uuid', 'user_id', 'parent_id', 'content', 'created_at', 'likes_count','thumbnail_file_id'])
            ->paginate($perPage);
    }

    /**
     * Get posts of target user by id.
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function getPostsByUserId(array $filters, int $targetUserId, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $keyword = trim((string) $filterCollection->get('q', ''));

        $query = $this->query()
            ->where('user_id', $targetUserId)
            ->when(
                $filterCollection->has('audience') && $filterCollection->get('audience') !== null,
                fn (Builder $query) => $query->where('audience', $filterCollection->get('audience'))
            )
            ->typeOf($filterCollection->get('type'))
            ->visibleFor($authUserId)
            ->when($keyword !== '', fn (Builder $query) => $this->applyPostAndUserSearchVector($query, $keyword))
            ->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $this->withDetail($query, $authUserId)->paginate($perPage);
    }

    /**
     * Get liked posts of target user by id.
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function getLikedPostsByUserId(array $filters, int $targetUserId, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->query()
            ->whereHas('userLikes', function (Builder $relationQuery) use ($targetUserId) {
                $relationQuery->where('user_id', $targetUserId);
            })
            ->typeOf($filterCollection->get('type'))
            ->visibleFor($authUserId)
            ->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $this->withDetail($query, $authUserId)->paginate($perPage);
    }

    /**
     * Get bookmarked posts of target user by id.
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function getBookmarkedPostsByUserId(array $filters, int $targetUserId, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $query = $this->query()
            ->whereHas('userBookmarks', function (Builder $relationQuery) use ($targetUserId) {
                $relationQuery->where('user_id', $targetUserId);
            })
            ->typeOf($filterCollection->get('type'))
            ->visibleFor($authUserId)
            ->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $this->withDetail($query, $authUserId)->paginate($perPage);
    }

    /**
     * Get posts of mutual friends.
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function getMutualFriendsPosts(array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $searchQuery = $this->buildSearchQuery($filterCollection)
            ->visibleFor($authUserId)
            ->whereHas('user', function (Builder $userQuery) use ($authUserId) {
                $userQuery
                    ->whereHas('followings', fn (Builder $query) => $query->whereKey($authUserId))
                    ->whereHas('followers', fn (Builder $query) => $query->whereKey($authUserId));
            })
            ->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $this->withDetail($searchQuery, $authUserId)->paginate($perPage);
    }

    /**
     * Get posts of following users.
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function getFollowingPosts(array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $searchQuery = $this->buildSearchQuery($filterCollection)
            ->visibleFor($authUserId)
            ->whereHas('user', function (Builder $userQuery) use ($authUserId) {
                $userQuery->whereHas('followers', fn (Builder $query) => $query->whereKey($authUserId));
            })
            ->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $this->withDetail($searchQuery, $authUserId)->paginate($perPage);
    }

    /**
     * Get related posts by target post, prioritizing same hashtags.
     *
     * @param  array<int, int>  $hashtagIds
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function getRelatedPosts(
        int $targetPostId,
        int $targetUserId,
        array $hashtagIds,
        array $filters,
        ?int $authUserId
    ): LengthAwarePaginator {
        $filterCollection = collect($filters);

        $query = $this->query()
            ->whereKeyNot($targetPostId)
            ->typeOf($filterCollection->get('type'))
            ->visibleFor($authUserId);

        if ($hashtagIds !== []) {
            $query
                ->whereHas('hashtags', function (Builder $hashtagQuery) use ($hashtagIds) {
                    $hashtagQuery->whereIn('hashtags.id', $hashtagIds);
                })
                ->withCount([
                    'hashtags as related_score' => function (Builder $hashtagQuery) use ($hashtagIds) {
                        $hashtagQuery->whereIn('hashtags.id', $hashtagIds);
                    },
                ])
                ->orderByDesc('related_score');
        } else {
            $query->where('user_id', $targetUserId);
        }

        $query->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $this->withDetail($query, $authUserId)->paginate($perPage);
    }

    /**
     * Search posts with filters and keyword.
     *
     * @param  array<string,mixed>  $filters
     * @return LengthAwarePaginator
     */
    public function search(array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);

        $searchQuery = $this->buildSearchQuery($filterCollection)
            ->visibleFor($authUserId)
            ->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $this->withDetail($searchQuery, $authUserId)->paginate($perPage);
    }

    /**
     * Get post with details by id.
     *
     * @param  Builder<Post>  $query
     * @return Builder<Post>
     */
    private function withDetail(Builder $query, ?int $authUserId): Builder
    {
        $queryUserId = $authUserId ?? -1000;

        return $query
            ->with([
                'hashtags',
                'mentions',
                'user' => fn (BelongsTo $userQuery) => $userQuery
                    ->select('users.*')
                    ->with('avatarFile')
                    ->selectSub(function (QueryBuilder $subQuery) {
                        $subQuery->from('posts')
                            ->selectRaw('COALESCE(SUM(likes_count), 0)')
                            ->whereColumn('posts.user_id', 'users.id');
                    }, 'likes_count')
                    ->withExists([
                        'followers as is_followed' => fn (Builder $followersQuery) => $followersQuery->whereKey($queryUserId),
                    ])
                    ->selectRaw('users.id = ? as is_owner', [$queryUserId]),
                'media.file',
                'thumbnailFile',
            ])
            ->withExists([
                'userLikes as is_liked' => fn (Builder $likesQuery) => $likesQuery->where('user_id', $queryUserId),
                'userBookmarks as is_bookmarked' => fn (Builder $bookmarksQuery) => $bookmarksQuery->where('user_id', $queryUserId),
            ]);
    }

    /**
     * Build search query with filters.
     * @param  Collection<string,mixed>  $filterCollection
     * @return Builder<Post>
     */
    private function buildSearchQuery(Collection $filterCollection): Builder
    {
        $keyword = trim((string) $filterCollection->get('q', ''));

        return $this->query()
            ->with(['user', 'media', 'hashtags', 'mentions', 'thumbnailFile'])
            ->when(
                $filterCollection->has('audience') && $filterCollection->get('audience') !== null,
                fn (Builder $query) => $query->where('audience', $filterCollection->get('audience'))
            )
            ->when(
                $filterCollection->has('user_id') && $filterCollection->get('user_id') !== null,
                fn (Builder $query) => $query->where('user_id', $filterCollection->get('user_id'))
            )
            ->when($filterCollection->get('username'), function (Builder $query, $username) {
                $query->whereHas('user', function (Builder $userQuery) use ($username) {
                    $userQuery->where('username', $username);
                });
            })
            ->when($filterCollection->get('user_uuid'), function (Builder $query, $userUuid) {
                $query->whereHas('user', function (Builder $userQuery) use ($userUuid) {
                    $userQuery->where('uuid', $userUuid);
                });
            })
            ->when(
                $filterCollection->has('parent_id') && $filterCollection->get('parent_id') !== null,
                fn (Builder $query) => $query->where('parent_id', $filterCollection->get('parent_id'))
            )
            ->typeOf($filterCollection->get('type'))
            ->when(! empty($filterCollection->get('hashtags')), function (Builder $query) use ($filterCollection) {
                $query->whereHas('hashtags', function (Builder $hashtagQuery) use ($filterCollection) {
                    $hashtagQuery->whereIn('name', $filterCollection->get('hashtags'));
                });
            })
            ->when(! empty($filterCollection->get('mentions')), function (Builder $query) use ($filterCollection) {
                $query->whereHas('mentions', function (Builder $mentionQuery) use ($filterCollection) {
                    $mentionQuery->whereIn('id', $filterCollection->get('mentions'));
                });
            })
            ->when($keyword !== '', fn (Builder $query) => $this->applyPostAndUserSearchVector($query, $keyword))
            ->when($filterCollection->get('date_from'), function (Builder $query, $dateFrom) {
                $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($filterCollection->get('date_to'), function (Builder $query, $dateTo) {
                $query->whereDate('created_at', '<=', $dateTo);
            });
    }

    /**
     * Apply full-text search on post and related user search vectors.
     * @param  Builder<Post>  $query
     * @param  string  $keyword
     * @return Builder<Post>
     */
    private function applyPostAndUserSearchVector(Builder $query, string $keyword): Builder
    {
        return $query->where(function (Builder $searchQuery) use ($keyword) {
            $this->applySearchVector($searchQuery, $keyword)
                ->orWhereHas('user', function (Builder $userSearchQuery) use ($keyword) {
                    $this->applySearchVector($userSearchQuery, $keyword);
                });
        });
    }

    /**
     * Apply full-text search condition on search_vector.
     * @param  Builder  $query
     * @param  string  $keyword
     * @return Builder
     */
    private function applySearchVector(Builder $query, string $keyword): Builder
    {
        return $query->whereRaw(
            "search_vector @@ plainto_tsquery('simple', ?)",
            [$keyword]
        );
    }
}
