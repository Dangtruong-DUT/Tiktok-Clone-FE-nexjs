<?php
namespace App\Repositories;

use App\Models\Post;
use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

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
     * Get post with details by id.
     * @param Builder<Post> $query
     * @param ?int $userId
     * @return Builder<Post>
     */
    public function withDetail(Builder $query, ?int $userId) : Builder
    {
        $queryUserId = $userId ?? -1000;
        return $query
            ->with([
                'hashtags',
                'mentions',
                'user' => fn ($q) => $q
                    ->with('avatarFile')
                    ->withCount([
                        'followings as following_count',
                        'followers as followers_count',
                        'likedPosts as likes_count',
                    ])
                    ->withExists([
                        'followers as is_followed' => fn ($fq) => $fq->whereKey($queryUserId),
                    ]),
                'media.file',
                'thumbnailFile',
            ])
            ->withExists([
                'userLikes as is_liked' => fn ($q) => $q->where('user_id', $queryUserId),
                'userBookmarks as is_bookmarked' => fn ($q) => $q->where('user_id', $queryUserId),
            ])
            ->addSelect([
                'is_owner' => DB::raw('user_id = ' . $queryUserId),
            ]);
    }
}
