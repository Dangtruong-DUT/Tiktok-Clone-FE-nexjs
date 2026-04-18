<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Models\User;
use App\Repositories\PostRepository;
use BadMethodCallException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CommentAdminService
{
    public function __construct(
        private readonly PostRepository $postRepository,
        private readonly AdminLogService $adminLogService,
        private readonly AdminModerationNoticeService $adminModerationNoticeService,
    ) {}

    /**
     * Get paginated list of comments with filtering
     * Note: Comments are stored in posts table with type='comment'
     *
     * @param array $filters {
     *     search?: string,
     *     post_uuid?: string,
     *     user_id?: int,
     *     date_from?: string (Y-m-d),
     *     date_to?: string (Y-m-d),
     *     page?: int,
     *     per_page?: int,
     *     sort_by?: string
     * }
    * @return LengthAwarePaginator
     */
    public function getFilteredComments(array $filters = []): LengthAwarePaginator
    {
        return $this->postRepository->searchCommentsForAdmin($filters);
    }

    /**
     * Delete a comment
     *
     * @param User $admin The admin performing the action
     * @param int $commentId The comment ID
     * @param array $data {reason: string}
     * @return void
     * @throws \Exception
     */
    public function deleteComment(User $admin, int $commentId, array $data): void
    {
        $comment = $this->postRepository->findOrFail($commentId);

        // Ensure it's actually a comment
        if ($comment->parent_id === null) {
            throw new BadMethodCallException('This is not a comment');
        }

        DB::transaction(function () use ($admin, $comment, $commentId, $data) {
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
                resourceId: $commentId,
                action: AdminActionEnum::DELETE_COMMENT,
                reason: $data['reason'],
                oldData: $oldData,
                newData: null,
            );

            $this->adminModerationNoticeService->send(
                admin: $admin,
                targetUser: $comment->user,
                action: AdminActionEnum::DELETE_COMMENT,
                reason: (string) $data['reason'],
                entityType: ModelEntityTypeEnum::POST,
                entityId: $comment->id,
                context: [
                    'resource_type' => ResourceTypeEnum::COMMENT->value,
                    'resource_id' => $comment->id,
                ]
            );
        });
    }
}
