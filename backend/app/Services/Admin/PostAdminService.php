<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Repositories\PostRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Exceptions\http\BadRequestException;
use App\Enums\Post\PostTypeEnum;

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
    *     status?: 'all'|'visible'|'deleted',
     *     date_from?: string (Y-m-d),
     *     date_to?: string (Y-m-d),
     *     page?: int,
     *     per_page?: int,
     *     order_by?: string
     * }
    * @return LengthAwarePaginator
     */
    public function getPosts(array $filters = []): LengthAwarePaginator
    {
        $filters['type'] = PostTypeEnum::POST->value;
        return $this->postRepository->searchPostsForAdmin($filters);
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

        if ($post->type !==PostTypeEnum::POST) {
            throw new BadRequestException('This is not a post');
        }

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