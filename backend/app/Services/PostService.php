<?php

namespace App\Services;

use App\Enums\Post\PostTypeEnum;
use App\Enums\Settings\PrivacyVisibilityEnum;
use App\Events\Social\PostCommentedEvent;
use App\Events\Social\PostLikedEvent;
use App\Events\Social\UserMentionedEvent;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\ForbiddenException;
use App\Exceptions\http\NotFoundException;
use App\Models\Post;
use App\Repositories\HashtagRepository;
use App\Repositories\MediaRepository;
use App\Repositories\PostRepository;
use App\Repositories\UserRepository;
use App\Repositories\VideoUploadSessionRepository;
use App\Models\User;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PostService
{
    use HasAuthUser;

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly PostRepository $postRepository,
        private readonly MediaRepository $mediaRepository,
        private readonly HashtagRepository $hashtagRepository,
        private readonly VideoUploadSessionRepository $uploadSessionRepository,
        private readonly AiModerationService $aiModerationService,
    ) {}

    /**
     * Create a new post.
     * @param  array{type?: string, parent_id?: int|null, audience: string, content: string, thumbnail?: int|null, medias?: array<int, array{file_id: int, type: string}>, mentions?: array<int, int>, hashtags?: array<int, string>}  $payload
     * @throws BusinessException
     * @throws NotFoundException
     */
    public function create(array $payload): Post
    {

        $postType = $payload['type'] ?? PostTypeEnum::POST->value;

        if ($postType !== PostTypeEnum::POST->value && empty($payload['parent_id'])) {
            throw new BusinessException('Parent ID is required for this post type.', [
                'type' => 'Parent ID is required for this post type.',
            ]);
        }

        if ($postType === PostTypeEnum::POST->value && ! empty($payload['parent_id'])) {
            throw new BusinessException('Parent ID is not allowed for this post type.', [
                'type' => 'Parent ID is not allowed for this post type.',
            ]);
        }

        $mentionSyncData = $this->resolveMentionSyncData($payload);
        $hashtagSyncData = $this->resolveHashtagSyncData($payload);

        $user = $this->guard()->user();
        $post = DB::transaction(function () use ($payload, $postType, $user, $mentionSyncData, $hashtagSyncData): Post {
            $parentPost = null;

            if (! empty($payload['parent_id'])) {
                $parentPost = $this->postRepository->findById($payload['parent_id']);
                if (! $parentPost) {
                    throw new NotFoundException('Parent post not found');
                }

                $this->updateParentCounter($parentPost, $postType, 'increment');
            }

            $post = $this->postRepository->create([
                'type' => $postType,
                'audience' => $payload['audience'],
                'content' => $payload['content'],

                'thumbnail_file_id' => $payload['thumbnail'] ?? null,
                'user_id' => $user->id,
                'parent_id' => $payload['parent_id'] ?? null,
            ]);
            if (! empty($mentionSyncData)) {
                $post->mentions()->sync($mentionSyncData);
            }
            if (! empty($hashtagSyncData)) {
                $this->syncHashtags($post, $hashtagSyncData);
            }

            if (! empty($payload['medias'])) {
                $resolvedMedias = $this->resolveMediaFileIds($payload['medias']);
                $this->mediaRepository->createMany($resolvedMedias, $post->id);
            }

            if ($parentPost && $postType === PostTypeEnum::COMMENT->value) {
                event(new PostCommentedEvent($user->id, $parentPost, $post));
            }

            if (! empty($mentionSyncData)) {
                event(new UserMentionedEvent($user->id, $post, array_keys($mentionSyncData)));
            }

            return $post;
        });

        $this->aiModerationService->enqueue($post);

        return $this->postRepository->getByIdWithDetail($post->id, $user->id);
    }

    /**
     * Update a post by uuid.
     * @param  array{post_uuid: string, content?: string, audience?: string, thumbnail?: int|null, mentions?: array<int, int>, hashtags?: array<int, string>}  $payload
     * @throws ForbiddenException
     * @throws NotFoundException
     * @throws BusinessException
     */
    public function update(array $payload): Post
    {
        $post = $this->findPostOrFail($payload['post_uuid']);
        $existingMentionUserIds = $post->mentions()->pluck('users.id')->map(fn ($id) => (int) $id)->toArray();

        $authUserId = auth_user_id();
        if ($post->user_id !== $authUserId) {
            throw new ForbiddenException('You can only update your own post');
        }

        $mentionSyncData = $this->resolveMentionSyncData($payload);
        $hashtagSyncData = $this->resolveHashtagSyncData($payload);

        $allowedFields = ['content', 'audience', 'thumbnail'];
        $dataToUpdate = array_intersect_key($payload, array_flip($allowedFields));

        if (empty($dataToUpdate) && ! array_key_exists('mentions', $payload) && ! array_key_exists('hashtags', $payload)) {
            throw new BusinessException('At least one field must be provided for update');
        }

        DB::transaction(function () use ($post, $payload, $dataToUpdate, $mentionSyncData, $hashtagSyncData): void {
            if (! empty($dataToUpdate)) {
                $this->postRepository->update($post->id, [
                    'content' => $dataToUpdate['content'] ?? $post->content,
                    'audience' => $dataToUpdate['audience'] ?? $post->audience,
                    'thumbnail_file_id' => array_key_exists('thumbnail', $dataToUpdate)
                        ? $dataToUpdate['thumbnail']
                        : $post->thumbnail_file_id,
                ]);
            }

            if (array_key_exists('mentions', $payload)) {
                $post->mentions()->sync($mentionSyncData);
            }

            if (array_key_exists('hashtags', $payload)) {
                $this->syncHashtags($post, $hashtagSyncData);
            }
        });

        $newMentionedUserIds = array_values(array_diff(array_keys($mentionSyncData), $existingMentionUserIds));
        if (! empty($newMentionedUserIds)) {
            event(new UserMentionedEvent($authUserId, $post, $newMentionedUserIds));
        }

        return $this->postRepository->getByIdWithDetail($post->id, $authUserId);
    }

    /**
     * Delete a post by uuid.
     * @throws ForbiddenException
     * @throws NotFoundException
     */
    public function delete(string $uuid): void
    {
        DB::transaction(function () use ($uuid): void {
            $post = $this->findPostOrFail($uuid);

            if ($post->user_id !== auth_user_id()) {
                throw new ForbiddenException('You can only delete your own post');
            }

            if ($post->parent_id) {
                $parentPost = $this->postRepository->findById($post->parent_id);

                if ($parentPost) {
                    $this->updateParentCounter($parentPost, $post->type->value, 'decrement');
                }
            }

            $this->postRepository->delete($post->id);
        });
    }

    /**
     * Get post by uuid.
     * @throws NotFoundException
     */
    public function getByUuidOrFail(string $uuid): Post
    {
        $userId = auth_user_id();
        $postDetail = $this->postRepository->getByUuidWithDetail($uuid, $userId);
        if (! $postDetail) {
            throw new NotFoundException('Post not found');
        }

        return $postDetail;
    }

    /**
     * Get list of child posts by parent post uuid.
     * @param  array{post_uuid: string, q?: string, audience?: string, post_type?: string, per_page?: int, page?: int}  $payload
     * @throws NotFoundException
     */
    public function getChildren(array $payload): LengthAwarePaginator
    {
        $postUuid = $payload['post_uuid'];
        $post = $this->findPostOrFail($postUuid);
        $authUserId = auth_user_id();

        return $this->postRepository->search([
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
     * @param  array{q?: string, audience?: string, post_type?: string, per_page?: int, page?: int}  $payload
     */
    public function search(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();

        return $this->postRepository->search([
            'q' => $payload['q'] ?? null,
            'audience' => $payload['audience'] ?? null,
            'type' => $payload['post_type'] ?? null,
            'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
            'page' => $payload['page'] ?? config('const.pagination.default_page'),
        ], $authUserId);
    }

    /**
     * Get related posts by post uuid.
     * @param  array{post_uuid: string, post_type?: string, per_page?: int}  $payload
     * @throws NotFoundException
     */
    public function getRelatedPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        $targetPost = $this->findPostOrFail($payload['post_uuid']);
        $hashtagIds = $targetPost->hashtags()->pluck('hashtags.id')->toArray();

        return $this->postRepository->getRelatedPosts(
            targetPostId: $targetPost->id,
            targetUserId: $targetPost->user_id,
            hashtagIds: $hashtagIds,
            filters: [
                'type' => $payload['post_type'] ?? PostTypeEnum::POST->value,
                'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
            ],
            authUserId: $authUserId
        );
    }

    /**
     * Get posts of friends.
     * @param  array{q?: string, per_page?: int, page?: int}  $payload
     */
    public function getMutualFriendsPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();

        return $this->postRepository->getMutualFriendsPosts(
            filters: [
                'q' => $payload['q'] ?? null,
                'per_page' => $payload['per_page'] ?? config('const.pagination.default_per_page'),
                'page' => $payload['page'] ?? config('const.pagination.default_page'),
            ],
            authUserId: $authUserId
        );
    }

    /**
     * Get posts of following users.
     * @param  array{q?: string, per_page?: int, page?: int}  $payload
     */
    public function getFollowingPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();

        return $this->postRepository->getFollowingPosts(
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
     * @param  array{user_uuid: string, post_type?: string, q?: string, audience?: string, per_page?: int}  $payload
     * @throws NotFoundException
     */
    public function getUserPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        $targetUser = $this->userRepository->findByUuidOrFail($payload['user_uuid']);

        return $this->postRepository->getPostsByUserId(
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
     * @param  array{user_uuid: string, post_type?: string, per_page?: int}  $payload
     * @throws NotFoundException
     * @throws ForbiddenException
     */
    public function getUserLikedPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        $targetUser = $this->userRepository->findByUuidOrFail($payload['user_uuid']);

        $this->ensureUserSettingsVisibility(
            targetUser: $targetUser,
            authUserId: $authUserId,
            settingField: 'liked_videos_visibility',
            forbiddenMessage: 'This user keeps liked videos private'
        );

        return $this->postRepository->getLikedPostsByUserId(
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
     * @param  array{user_uuid: string, post_type?: string, per_page?: int}  $payload
     * @throws NotFoundException
     * @throws ForbiddenException
     */
    public function getUserBookmarkedPosts(array $payload): LengthAwarePaginator
    {
        $authUserId = auth_user_id();
        $targetUser = $this->userRepository->findByUuidOrFail($payload['user_uuid']);

        $this->ensureUserSettingsVisibility(
            targetUser: $targetUser,
            authUserId: $authUserId,
            settingField: 'bookmarked_videos_visibility',
            forbiddenMessage: 'This user keeps bookmarked videos private'
        );

        return $this->postRepository->getBookmarkedPostsByUserId(
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
     * @throws NotFoundException
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

            event(new PostLikedEvent(auth_user_id(), $post));
        });
    }

    /**
     * Unlike a post.
     * @throws NotFoundException
     */
    public function unlike(string $uuid): void
    {
        DB::transaction(function () use ($uuid) {
            $post = $this->findPostOrFail($uuid);

            if (! $post->userLikes()->where('user_id', auth_user_id())->exists()) {
                return;
            }
            $post->userLikes()->detach(auth_user_id());
            $post->decrement('likes_count');
        });
    }

    /**
     * Bookmark a post.
     * @throws NotFoundException
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
     * @throws NotFoundException
     */
    public function unbookmark(string $uuid): void
    {
        DB::transaction(function () use ($uuid) {
            $post = $this->findPostOrFail($uuid);

            if (! $post->userBookmarks()->where('user_id', auth_user_id())->exists()) {
                return;
            }
            $post->userBookmarks()->detach(auth_user_id());
            $post->decrement('bookmarks_count');
        });
    }

    /**
     * Find post by uuid or throw not found exception.
     * @throws NotFoundException
     */
    private function findPostOrFail(string $uuid): Post
    {
        $post = $this->postRepository->findByUuid($uuid);

        if (! $post) {
            throw new NotFoundException('Post not found');
        }

        return $post;
    }

    /**
     * Sync hashtags to post.
     * @param  array<int, array{name: string, start: int|null, end: int|null}>  $hashtags
     */
    private function syncHashtags(Post $post, array $hashtags): void
    {
        if (empty($hashtags)) {
            $post->hashtags()->sync([]);

            return;
        }

        $hashtagNames = array_values(array_unique(array_map(fn ($item) => (string) $item['name'], $hashtags)));

        if (empty($hashtagNames)) {
            $post->hashtags()->sync([]);

            return;
        }

        $existingHashtags = $this->hashtagRepository->getByNames($hashtagNames)
            ->keyBy('name');
        $newHashtags = [];

        foreach ($hashtagNames as $hashtagName) {
            if (! isset($existingHashtags[$hashtagName])) {
                $newHashtags[] = ['name' => $hashtagName];
            }
        }

        if (! empty($newHashtags)) {
            $this->hashtagRepository->createMany($newHashtags);
        }

        $hashtagMapByName = $this->hashtagRepository->getByNames($hashtagNames)
            ->keyBy('name');

        $syncData = [];
        foreach ($hashtags as $hashtag) {
            $hashtagName = (string) $hashtag['name'];
            if (! isset($hashtagMapByName[$hashtagName])) {
                continue;
            }

            $syncData[(int) $hashtagMapByName[$hashtagName]->id] = [
                'start' => $hashtag['start'],
                'end' => $hashtag['end'],
            ];
        }

        $post->hashtags()->sync($syncData);
    }

    /**
     * Resolve session_uuid references in media items to their upload_file_id.
     * Supports mixed payloads where items may carry either file_id or session_uuid.
     *
     * @param  array<int, array{file_id?: int, session_uuid?: string, type: string}>  $medias
     * @return array<int, array{file_id: int, type: string}>
     * @throws BusinessException  If a session UUID cannot be resolved to a completed upload.
     */
    private function resolveMediaFileIds(array $medias): array
    {
        $sessionUuids = array_values(array_filter(
            array_column($medias, 'session_uuid'),
            fn ($v) => ! empty($v)
        ));

        $sessionMap = $this->uploadSessionRepository->getFileIdsByUuids($sessionUuids);

        return array_map(function (array $media) use ($sessionMap): array {
            if (empty($media['session_uuid'])) {
                return $media;
            }

            $fileId = $sessionMap[$media['session_uuid']] ?? null;

            if (! $fileId) {
                throw new BusinessException(
                    "Upload session [{$media['session_uuid']}] has not been completed yet."
                );
            }

            return ['file_id' => $fileId, 'type' => $media['type']];
        }, $medias);
    }

    /**
     * Resolve mention sync data [userId => pivotData].
     * @return array<int, array{start: int|null, end: int|null}>
     */
    private function resolveMentionSyncData(array $payload): array
    {
        $explicitMentionIds = collect($payload['mentions'] ?? [])
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->values()
            ->toArray();

        $mentionTokens = $this->extractMentionTokens($payload['content'] ?? '');
        $mentionUsernames = array_values(array_unique(array_map(fn ($item) => $item['username'], $mentionTokens)));
        $userIdMap = $this->userRepository->getIdMapByUsernames($mentionUsernames);

        $syncData = [];

        foreach ($mentionTokens as $token) {
            $username = (string) $token['username'];
            if (! isset($userIdMap[$username])) {
                continue;
            }

            $userId = (int) $userIdMap[$username];
            if (isset($syncData[$userId])) {
                continue;
            }

            $syncData[$userId] = [
                'start' => $token['start'],
                'end' => $token['end'],
            ];
        }

        foreach ($explicitMentionIds as $userId) {
            $syncData[$userId] = $syncData[$userId] ?? [
                'start' => null,
                'end' => null,
            ];
        }

        return $syncData;
    }

    /**
     * Resolve hashtag sync payload with positions.
     * @return array<int, array{name: string, start: int|null, end: int|null}>
     */
    private function resolveHashtagSyncData(array $payload): array
    {
        $explicitHashtags = collect($payload['hashtags'] ?? [])
            ->map(fn ($name) => trim((string) $name))
            ->filter(fn ($name) => $name !== '')
            ->map(fn ($name) => mb_strtolower(ltrim($name, '#')))
            ->values()
            ->toArray();

        $hashtagTokens = $this->extractHashtagTokens($payload['content'] ?? '');
        $hashtagMap = [];

        foreach ($hashtagTokens as $token) {
            $hashtagName = (string) $token['name'];
            if (isset($hashtagMap[$hashtagName])) {
                continue;
            }

            $hashtagMap[$hashtagName] = [
                'name' => $hashtagName,
                'start' => $token['start'],
                'end' => $token['end'],
            ];
        }

        foreach ($explicitHashtags as $hashtagName) {
            $hashtagMap[$hashtagName] = $hashtagMap[$hashtagName] ?? [
                'name' => $hashtagName,
                'start' => null,
                'end' => null,
            ];
        }

        return array_values($hashtagMap);
    }

    /**
     * Extract mention tokens with positions from content.
     * @return array<int, array{username: string, start: int, end: int}>
     */
    private function extractMentionTokens(string $content): array
    {
        $tokens = $this->extractTokenMatches($content, (string) config('regex.social.mention_token'));

        return collect($tokens)
            ->map(fn ($token) => [
                'username' => $token['value'],
                'start' => $token['start'],
                'end' => $token['end'],
            ])
            ->values()
            ->toArray();
    }

    /**
     * Extract hashtag tokens with positions from content.
     * @return array<int, array{name: string, start: int, end: int}>
     */
    private function extractHashtagTokens(string $content): array
    {
        $tokens = $this->extractTokenMatches($content, (string) config('regex.social.hashtag_token'));

        return collect($tokens)
            ->map(fn ($token) => [
                'name' => mb_strtolower($token['value']),
                'start' => $token['start'],
                'end' => $token['end'],
            ])
            ->values()
            ->toArray();
    }

    /**
     * Extract first capture group matches and positions for a regex.
     * @return array<int, array{value: string, start: int, end: int}>
     */
    private function extractTokenMatches(string $content, string $pattern): array
    {
        if ($content === '') {
            return [];
        }

        preg_match_all($pattern, $content, $matches, PREG_OFFSET_CAPTURE);

        $tokens = [];
        foreach ($matches[1] ?? [] as $match) {
            [$value, $offset] = $match;

            $value = trim((string) $value);
            $offset = (int) $offset;

            if ($value === '' || $offset <= 0) {
                continue;
            }

            $start = $this->byteOffsetToCharOffset($content, $offset - 1);
            $end = $start + mb_strlen($value, 'UTF-8') + 1;

            $tokens[] = [
                'value' => $value,
                'start' => $start,
                'end' => $end,
            ];
        }

        return collect($tokens)
            ->unique()
            ->values()
            ->toArray();
    }

    /**
     * Convert byte offset to UTF-8 character offset.
     */
    private function byteOffsetToCharOffset(string $content, int $byteOffset): int
    {
        if ($byteOffset <= 0) {
            return 0;
        }

        return mb_strlen(substr($content, 0, $byteOffset), 'UTF-8');
    }

    /**
     * Ensure target user's privacy setting allows current viewer.
     * @throws ForbiddenException
     */
    private function ensureUserSettingsVisibility(
        User $targetUser,
        ?int $authUserId,
        string $settingField,
        string $forbiddenMessage
    ): void {
        if ($authUserId === $targetUser->id) {
            return;
        }

        $targetUser->loadMissing('settings');
        $visibility = $targetUser->settings?->{$settingField};

        if ($visibility === PrivacyVisibilityEnum::PRIVATE) {
            throw new ForbiddenException($forbiddenMessage);
        }
    }

    /**
     * Update parent post counter by post type.
     */
    private function updateParentCounter(Post $parentPost, string $type, string $action = 'increment'): void
    {
        $map = [
            PostTypeEnum::RE_POST->value => 'repost_count',
            PostTypeEnum::QUOTE_POST->value => 'quote_post_count',
            PostTypeEnum::COMMENT->value => 'comments_count',
        ];

        if (! isset($map[$type])) {
            return;
        }

        $field = $map[$type];

        $action === 'increment'
            ? $parentPost->increment($field)
            : $parentPost->decrement($field);
    }
}
