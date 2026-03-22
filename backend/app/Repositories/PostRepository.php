<?php
namespace App\Repositories;

use App\Models\Post;
use App\Repositories\BaseRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class PostRepository  extends BaseRepository
{


    /**
     * PostRepository constructor.
     */
    public function __construct()
    {
        $modelInstance = app()->make(Post::class);
        parent::__construct($modelInstance);
    }

    /**
     * Check if a post exists by id.
     * @param int $id
     * @return bool
     */
    public function isExist(int $id): bool
    {
        return $this->query()->where('id', $id)->exists();
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
        return $this->query()->where('id', $id)->first();
    }


    /**
     * Get post with details by id.
     * @param int $id
     * @param ?int $userId
     * @return Post|null
     */
    public function getByIdWithDetail(int $id, ?int $userId): ?Post
    {
        $query = $this->query()->whereKey($id);
        return $this->withDetail(
            $query,
            $userId
        )->first();
    }

    /**
     * Get post with details by uuid.
     * @param string $uuid
     * @param ?int $userId
     * @return Post|null
     */
    public function getByUuidWithDetail(string $uuid, ?int $userId): ?Post
    {
        $query = $this->query()->where('uuid', $uuid);
        return $this->withDetail(
            $query,
            $userId
        )->first();
    }

    /**
     * Find a post by its UUID.
     * @param string $uuid
     * @return Post|null
     */
    public function findByUuid(string $uuid): ?Post
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    /**
     * get posts of target user by target user by id.
     * @param array $filters
     *                     - per_page: number of items per page for pagination
     *                     - type: filter by post type (comment,post, re-post, quote)
     * @param int $targetUserId
     * @param ?int $authUserId
     * @return LengthAwarePaginator
     */
    public function getPostsByUserId(array $filters, int $targetUserId, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $query = $this->query()
            ->where('user_id', $targetUserId)
            ->typeOf($filterCollection->get('type'))
            ->visibleFor($authUserId)
            ->orderByDesc('created_at');
            $perPage = $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

            return $this->withDetail($query, $authUserId)
                    ->paginate($perPage);
    }

    /**
     * Get liked posts of target user by id.
     * @param array $filters
     *                     - per_page: number of items per page for pagination
     *                     - type: filter by post type (comment,post, re-post, quote)
     * @param int $targetUserId
     * @param ?int $authUserId
     * @return LengthAwarePaginator
     */
    public function getLikedPostsByUserId(array $filters, int $targetUserId, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $query = $this->query()
            ->whereHas('userLikes', function ($q) use ($targetUserId) {
                $q->where('user_id', $targetUserId);
            })
            ->typeOf($filterCollection->get('type'))
            ->visibleFor($authUserId)
            ->orderByDesc('created_at');
            $perPage = $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

            return $this->withDetail($query, $authUserId)
                    ->paginate($perPage);
    }

    /**
     * Get bookmarked posts of target user by id.
     * @param array $filters
     *                     - per_page: number of items per page for pagination
     *                     - type: filter by post type (comment,post, re-post, quote)
     * @param int $targetUserId
     * @param ?int $authUserId
     * @return LengthAwarePaginator
     */
    public function getBookmarkedPostsByUserId(array $filters, int $targetUserId, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $query = $this->query()
            ->whereHas('userBookmarks', function ($q) use ($targetUserId) {
                $q->where('user_id', $targetUserId);
            })
            ->typeOf($filterCollection->get('type'))
            ->visibleFor($authUserId)
            ->orderByDesc('created_at');
            $perPage = $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));
        return $this->withDetail($query, $authUserId)
                    ->paginate($perPage);
    }


    /**
     * Search posts with filters and keyword.
     * @param array $filters
     *                      - q: search keyword for content and user name
     *                      - user_id: filter by user id
     *                      - hashtags: filter by array of hashtag names
     *                      - mentions: filter by array of mention user ids
     *                      - type: filter by post type (comment,post, re-post, quote)
     *                      - audience: filter by audience type (private, public, followers)
     *                      - parent_id: filter by parent post id (for comments)
     *                      - per_page: number of items per page for pagination
     *
     * @param ?int $authUserId
     * @return LengthAwarePaginator
     */
    public function search(array $filters = [], ?int $authUserId): LengthAwarePaginator
    {
        $collection = collect($filters);
        $searchQuery = $this->buildSearchQuery($collection)
                ->visibleFor($authUserId)
                ->orderByDesc('created_at');
        $perPage = $collection->get('per_page', config('const.pagination.default_per_page', 10));
        return $this->withDetail($searchQuery, $authUserId)->paginate($perPage);
    }

    /**
     * Get post with details by id.
     * @param Builder<Post> $query
     * @param ?int $authUserId
     * @return Builder<Post>
     */
    private function withDetail(Builder $query, ?int $authUserId) : Builder
    {
        $queryUserId = $authUserId ?? -1000;
        return $query
            ->with([
                'hashtags',
                'mentions',
                'user' => fn ($q) => $q
                    ->select('users.*')
                    ->with('avatarFile')
                    ->selectSub(function ($query) {
                        $query->from('posts')
                            ->selectRaw('COALESCE(SUM(likes_count), 0)')
                            ->whereColumn('posts.user_id', 'users.id');
                    }, 'likes_count')
                    ->withExists([
                        'followers as is_followed' => fn ($fq) => $fq->whereKey($queryUserId),
                    ])
                    ->selectRaw('users.id = ? as is_owner', [$queryUserId]),
                'media.file',
                'thumbnailFile',
            ])
            ->withExists([
                'userLikes as is_liked' => fn ($q) => $q->where('user_id', $queryUserId),
                'userBookmarks as is_bookmarked' => fn ($q) => $q->where('user_id', $queryUserId),
            ]);
    }

    /**
     * Build search query with filters
     *
     * @param  Collection $collection
     *                      - q: search keyword for content and user name
     *                      - user_id: filter by user id
     *                      - username: filter by user name
     *                      - user_uuid: filter by user uuid
     *                      - hashtags: filter by array of hashtag names
     *                      - mentions: filter by array of mention user ids
     *                      - type: filter by post type (comment,post, re-post, quote)
     *                      - parent_id: filter by parent post id (for comments)
     * @return Builder
     */
    private function buildSearchQuery(Collection $collection): Builder
    {
        $keyword = trim($collection->get('q', ''));

        return $this->query()
            ->with(['user','media','hashtags','mentions','thumbnailFile'])
            // filter audience
            ->when($collection->get('audience'), function ($query, $audience) {
                $query->where('audience', $audience);
            })
            // filter user
            ->when($collection->get('user_id'), function ($query, $userId) {
                $query->where('user_id', $userId);
            })
            // filter username
            ->when($collection->get('username'), function ($query, $username) {
                $query->whereHas('user', function ($q) use ($username) {
                    $q->where('username', $username);
                });
            })
            // filter user uuid
            ->when($collection->get('user_uuid'), function ($query, $userUuid) {
                $query->whereHas('user', function ($q) use ($userUuid) {
                    $q->where('uuid', $userUuid);
                });
            })
            // filter parent post
            ->when($collection->get('parent_id'), function ($query, $parentId) {
                $query->where('parent_id', $parentId);
            })
            // filter post type
            ->typeOf($collection->get('type'))

            // hashtags
            ->when(!empty($collection->get('hashtags')), function ($query) use ($collection) {
                $query->whereHas('hashtags', function ($q) use ($collection) {
                    $q->whereIn('name', $collection->get('hashtags'));
                });
            })

            // mentions
            ->when(!empty($collection->get('mentions')), function ($query) use ($collection) {
                $query->whereHas('mentions', function ($q) use ($collection) {
                    $q->whereIn('id', $collection->get('mentions'));
                });
            })

            // full-text search
            ->when($keyword !== '', function ($query) use ($keyword) {

                $query->where(function ($q) use ($keyword) {

                    $q->whereRaw("
                        search_vector @@ plainto_tsquery('simple', ?)
                    ", [$keyword])

                    ->orWhereHas('user', function ($userQ) use ($keyword) {
                        $userQ->whereRaw("
                            search_vector @@ plainto_tsquery('simple', ?)
                        ", [$keyword]);
                    });

                });

            });
    }
}
