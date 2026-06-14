<?php

namespace App\Services\Post;

use App\Repositories\PostRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class PostViewService
{
    private const REDIS_POST_IDS_SET_KEY = 'post:view:posts';

    private const USER_VIEW_KEY_PREFIX = 'post:view:user:';

    private const GUEST_VIEW_KEY_PREFIX = 'post:view:guest:';

    private const ANTISPAM_KEY_PREFIX = 'post:view:lock:';

    private const ANTISPAM_TTL_SECONDS = 60;

    /**
     * Create a new service instance.
     *
     * @param  PostRepository  $postRepository
     */
    public function __construct(
        private readonly PostRepository $postRepository
    ) {}

    /**
     * Increase view count for a post, with anti-spam measures.
     *
     * @param  int  $postId
     * @param  int|null  $authUserId  ID of the authenticated user (null for guests)
     * @param  string|null  $ip  Request IP used to build guest fingerprint
     * @param  string|null  $userAgent  Request User-Agent used to build guest fingerprint
     */
    public function increaseView(int $postId, ?int $authUserId, ?string $ip = null, ?string $userAgent = null): void
    {
        $viewerFingerprint = ($ip !== null) ? implode('|', [$ip, $userAgent ?? '']) : null;

        $viewerKey = $authUserId
            ? "user:{$authUserId}"
            : 'guest:'.sha1((string) $viewerFingerprint);

        $lockKey = self::ANTISPAM_KEY_PREFIX.$postId.':'.$viewerKey;

        $isFirstView = Redis::setnx($lockKey, 1);

        if (! $isFirstView) {
            return;
        }

        Redis::expire($lockKey, self::ANTISPAM_TTL_SECONDS);

        $counterKey = $authUserId
            ? self::USER_VIEW_KEY_PREFIX.$postId
            : self::GUEST_VIEW_KEY_PREFIX.$postId;

        Redis::incr($counterKey);
        Redis::sadd(self::REDIS_POST_IDS_SET_KEY, (string) $postId);
    }

    /**
     * Sync view counts from Redis to database
     * @return int Number of posts synced
     */
    public function syncViewsToDatabase(): int
    {
        $postIds = Redis::smembers(self::REDIS_POST_IDS_SET_KEY);

        if (empty($postIds)) {
            return 0;
        }

        $synced = 0;

        foreach ($postIds as $rawPostId) {
            $postId = (int) $rawPostId;

            if ($postId <= 0) {
                Redis::srem(self::REDIS_POST_IDS_SET_KEY, $rawPostId);
                continue;
            }

            $userKey = self::USER_VIEW_KEY_PREFIX.$postId;
            $guestKey = self::GUEST_VIEW_KEY_PREFIX.$postId;

            // Atomically read-and-delete each counter before touching the DB.
            // If the DB write fails below, the worst case is we lose these view
            // counts for this sync cycle — acceptable vs. losing them permanently
            // by deleting inside a DB transaction that then rolls back.
            $userViews  = (int) (Redis::getdel($userKey)  ?? 0);
            $guestViews = (int) (Redis::getdel($guestKey) ?? 0);
            Redis::srem(self::REDIS_POST_IDS_SET_KEY, $rawPostId);

            if ($userViews > 0 || $guestViews > 0) {
                $this->postRepository->incrementViews($postId, $userViews, $guestViews);
            }

            $synced++;
        }

        return $synced;
    }
}
