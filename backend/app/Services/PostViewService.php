<?php

namespace App\Services;

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

    public function __construct(
        private readonly PostRepository $postRepo
    ) {}

    /**
     * Increase view count for a post, with anti-spam measures
     * @param  int  $postId  ID of the post being viewed
     * @param  int|null  $authUserId  ID of the authenticated user (null for guests)
     * @param  string|null  $viewerFingerprint  Unique fingerprint for guest viewers
 */
    public function increaseView(int $postId, ?int $authUserId, ?string $viewerFingerprint = null): void
    {
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

        DB::transaction(function () use ($postIds, &$synced) {

            foreach ($postIds as $postId) {
                $postId = (int) $postId;

                if ($postId <= 0) {
                    Redis::srem(self::REDIS_POST_IDS_SET_KEY, (string) $postId);

                    continue;
                }

                $userKey = self::USER_VIEW_KEY_PREFIX.$postId;
                $guestKey = self::GUEST_VIEW_KEY_PREFIX.$postId;

                $userViews = (int) Redis::get($userKey) ?? 0;
                $guestViews = (int) Redis::get($guestKey) ?? 0;

                if ($userViews > 0 || $guestViews > 0) {
                    $this->postRepo->incrementViews(
                        $postId,
                        $userViews,
                        $guestViews
                    );
                }

                Redis::del($userKey, $guestKey);
                Redis::srem(self::REDIS_POST_IDS_SET_KEY, (string) $postId);

                $synced++;
            }
        });

        return $synced;
    }
}
