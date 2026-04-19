<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Models\Post;
use App\Repositories\PostRepository;
use App\Traits\HasAuthUser;
use BadMethodCallException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PostAdminService
{
    use HasAuthUser;

    public function __construct(
        private readonly PostRepository $postRepository,
        private readonly AdminLogService $adminLogService,
        private readonly AdminModerationNoticeService $adminModerationNoticeService,
    ) {}

    /**
     * Get paginated list of posts with filtering
     *
     * @param array $filters {
     *     q?: string,
     *     user_uuid?: string,
     *     status?: 'all'|'visible'|'hidden'|'deleted',
     *     date_from?: string (Y-m-d),
     *     date_to?: string (Y-m-d),
     *     page?: int,
     *     per_page?: int,
     *     order_by?: string
     * }
    * @return LengthAwarePaginator
     */
    public function getFilteredPosts(array $filters = []): LengthAwarePaginator
    {
        return $this->postRepository->searchForAdmin($filters);
    }

    /**
     * Get post detail
     *
     * @param string $uuid
     * @return Post
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function getPostDetail(string $uuid): Post
    {
        return $this->postRepository->query()->where('uuid', $uuid)
            ->with([
                'user:id,username,avatar_file_id,verify',
                'user.avatarFile:id,url',
                'media:id,post_id,type,upload_file_id',
                'media.file:id,url',
                'hashTags:id,name',
                'mentions:id,user_id,mentioned_user_id',
            ])
            ->firstOrFail();
    }

    /**
     * Hide a post from public view
     *
     * @param array{post_uuid:string,reason:string} $payload
     * @return Post Updated post
     * @throws \Exception
     */
    public function hidePost(array $payload): Post
    {
        $admin = $this->guard()->user();
        $post = $this->postRepository->findByUuidOrFail((string) $payload['post_uuid']);

        if ($post->hidden_at !== null) {
            throw new BadMethodCallException('Post is already hidden');
        }

        return DB::transaction(function () use ($admin, $post, $payload) {
            $oldData = $post->only(['hidden_at', 'hidden_reason']);

            $post->update([
                'hidden_at' => now(),
                'hidden_reason' => $payload['reason'],
            ]);

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::POST,
                resourceId: $post->id,
                action: AdminActionEnum::HIDE_POST,
                reason: $payload['reason'],
                oldData: $oldData,
                newData: $post->only(['hidden_at', 'hidden_reason']),
            );

            $this->adminModerationNoticeService->send(
                admin: $admin,
                targetUser: $post->user,
                action: AdminActionEnum::HIDE_POST,
                reason: (string) $payload['reason'],
                entityType: ModelEntityTypeEnum::POST,
                entityId: $post->id,
                context: [
                    'resource_type' => ResourceTypeEnum::POST->value,
                    'resource_id' => $post->id,
                ]
            );

            return $post;
        });
    }

    /**
     * Unhide a post (make it visible again)
     *
     * @param array{post_uuid:string} $payload
     * @return Post Updated post
     * @throws \Exception
     */
    public function unhidePost(array $payload): Post
    {
        $admin = $this->guard()->user();
        $post = $this->postRepository->findByUuidOrFail((string) $payload['post_uuid']);

        if ($post->hidden_at === null) {
            throw new BadMethodCallException('Post is not hidden');
        }

        return DB::transaction(function () use ($admin, $post) {
            $oldData = $post->only(['hidden_at', 'hidden_reason']);

            $post->update([
                'hidden_at' => null,
                'hidden_reason' => null,
            ]);

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::POST,
                resourceId: $post->id,
                action: AdminActionEnum::UNHIDE_POST,
                oldData: $oldData,
                newData: $post->only(['hidden_at', 'hidden_reason']),
            );

            $this->adminModerationNoticeService->send(
                admin: $admin,
                targetUser: $post->user,
                action: AdminActionEnum::UNHIDE_POST,
                reason: 'Your post is visible again after admin review',
                entityType: ModelEntityTypeEnum::POST,
                entityId: $post->id,
                context: [
                    'resource_type' => ResourceTypeEnum::POST->value,
                    'resource_id' => $post->id,
                ]
            );

            return $post;
        });
    }

    /**
     * Delete a post permanently (soft delete)
     *
     * @param array{post_uuid:string,reason:string} $payload
     * @return void
     * @throws \Exception
     */
    public function deletePost(array $payload): void
    {
        $admin = $this->guard()->user();
        $post = $this->postRepository->findByUuidOrFail((string) $payload['post_uuid']);

        DB::transaction(function () use ($admin, $post, $payload) {
            $oldData = [
                'uuid' => $post->uuid,
                'user_id' => $post->user_id,
                'content' => $post->content,
            ];

            $post->delete();

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::POST,
                resourceId: $post->id,
                action: AdminActionEnum::DELETE_POST,
                reason: $payload['reason'],
                oldData: $oldData,
                newData: null,
            );

            $this->adminModerationNoticeService->send(
                admin: $admin,
                targetUser: $post->user,
                action: AdminActionEnum::DELETE_POST,
                reason: (string) $payload['reason'],
                entityType: ModelEntityTypeEnum::POST,
                entityId: $post->id,
                context: [
                    'resource_type' => ResourceTypeEnum::POST->value,
                    'resource_id' => $post->id,
                ]
            );
        });
    }
}
