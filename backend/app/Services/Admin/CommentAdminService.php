<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Enums\Post\PostTypeEnum;
use App\Exceptions\http\BadRequestException;
use App\Repositories\PostRepository;
use App\Traits\HasAuthUser;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CommentAdminService
{
    use HasAuthUser;

    public function __construct(
        private readonly PostRepository $postRepository,
        private readonly AdminLogService $adminLogService,
        private readonly AdminModerationNoticeService $adminModerationNoticeService,
    ) {}

    /**
     * Get paginated list of comments with filtering.
    * @param  array{q?: string, post_uuid?: string, user_uuid?: string, date_from?: string, date_to?: string, page?: int, per_page?: int, order_by?: array<int, string>}  $filters
     */
    public function getComments(array $filters = []): LengthAwarePaginator
    {
        return $this->postRepository->searchCommentsForAdmin($filters);
    }

    /**
     * Delete a comment.
     * @param  array{comment_uuid:string,reason:string}  $payload
     * @throws BadRequestException
     * @throws \App\Exceptions\http\NotFoundException
     */
    public function deleteComment(array $payload): void
    {
        $admin = $this->guard()->user();
        $comment = $this->postRepository->findByUuidOrFail((string) $payload['comment_uuid']);

        if ($comment->parent_id === null || $comment->type !== PostTypeEnum::COMMENT) {

            throw new BadRequestException('This is not a comment');
        }

        DB::transaction(function () use ($admin, $comment, $payload) {
            $oldData = [
                'id' => $comment->id,
                'uuid' => $comment->uuid,
                'user_id' => $comment->user_id,
                'content' => $comment->content,
                'parent_id' => $comment->parent_id,
            ];

            $comment->delete();

            if ($comment->parent_id) {
                $parent = $this->postRepository->find($comment->parent_id);
                if ($parent) {
                    $parent->decrement('comments_count');
                }
            }

            $this->adminLogService->log(
                admin: $admin,
                resourceType: ResourceTypeEnum::COMMENT,
                resourceId: $comment->id,
                action: AdminActionEnum::DELETE_COMMENT,
                reason: $payload['reason'],
                oldData: $oldData,
                newData: null,
            );

            $this->adminModerationNoticeService->send(
                admin: $admin,
                targetUser: $comment->user,
                action: AdminActionEnum::DELETE_COMMENT,
                reason: (string) $payload['reason'],
                entityType: ModelEntityTypeEnum::POST,
                entityId: $comment->id,
                context: [
                    'resource_type' => ResourceTypeEnum::COMMENT->value,
                    'resource_id' => $comment->id,
                    'resource_uuid' => $comment->uuid,
                ]
            );
        });
    }
}
