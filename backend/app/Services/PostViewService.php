<?php
namespace App\Services;

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
     * Increase view count for a post
     *
     * @param int $postId
     * @param int|null $authUserId
     * @param string|null $viewerFingerprint
     * @return void
     */
    public function increaseView(int $postId, ?int $authUserId, ?string $viewerFingerprint = null): void
    {
        $viewerKey = $authUserId
            ? "user:{$authUserId}"
            : 'guest:'.sha1((string) $viewerFingerprint);

        $antiSpamKey = self::ANTISPAM_KEY_PREFIX.$postId.':'.$viewerKey;
        $isFirstViewInWindow = (bool) Redis::setnx($antiSpamKey, 1);

        if (!$isFirstViewInWindow) {
            return;
        }

        Redis::expire($antiSpamKey, self::ANTISPAM_TTL_SECONDS);

        $viewKeyPrefix = $authUserId ? self::USER_VIEW_KEY_PREFIX : self::GUEST_VIEW_KEY_PREFIX;
        Redis::incr($viewKeyPrefix.$postId);
        Redis::sadd(self::REDIS_POST_IDS_SET_KEY, (string) $postId);
    }

    /**
     * Sync Redis view counters to database in batch and clear Redis counters.
     *
     * @return int
     */
    public function syncViewsToDatabase(): int
    {
        $postIds = Redis::smembers(self::REDIS_POST_IDS_SET_KEY);

        if (empty($postIds)) {
            return 0;
        }

        $syncedPosts = 0;

        DB::transaction(function () use ($postIds, &$syncedPosts): void {
            foreach ($postIds as $postId) {
                $postId = (int) $postId;

                if ($postId <= 0) {
                    Redis::srem(self::REDIS_POST_IDS_SET_KEY, (string) $postId);
                    continue;
                }

                $userViewKey = self::USER_VIEW_KEY_PREFIX.$postId;
                $guestViewKey = self::GUEST_VIEW_KEY_PREFIX.$postId;

                $values = Redis::mget([$userViewKey, $guestViewKey]);
                $userViews = (int) ($values[0] ?? 0);
                $guestViews = (int) ($values[1] ?? 0);

                if ($userViews <= 0 && $guestViews <= 0) {
                    Redis::srem(self::REDIS_POST_IDS_SET_KEY, (string) $postId);
                    continue;
                }

                $updated = DB::table('posts')
                    ->where('id', $postId)
                    ->update([
                        'user_views' => DB::raw('user_views + '.max($userViews, 0)),
                        'guest_views' => DB::raw('guest_views + '.max($guestViews, 0)),
                        'updated_at' => now(),
                    ]);

                if ($updated > 0) {
                    $syncedPosts++;
                }

                Redis::del($userViewKey, $guestViewKey);
                Redis::srem(self::REDIS_POST_IDS_SET_KEY, (string) $postId);
            }
        });

        return $syncedPosts;
    }
}
