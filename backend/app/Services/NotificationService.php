<?php

namespace App\Services;

use App\Enums\Common\ModelEntityTypeEnum;
use App\Enums\Notification\NotificationTypeEnum;
use App\Enums\Post\PostTypeEnum;
use App\Exceptions\http\NotFoundException;
use App\Models\Post;
use App\Repositories\NotificationRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationService
{
    private const EXCERPT_LIMIT = 120;

    public function __construct(
        private readonly NotificationRepository $notificationRepository
    ) {}

    /**
     * Get current user notifications by tab with pagination.
     *
     * @param  array<string, mixed>  $filters
     *                                         - 'tab' (string): Filter notifications by tab'likes', 'comments', 'mentions', 'followers'.
     *                                         - 'per_page' (int): Number of notifications per page.
     */
    public function getNotifications(array $filters): LengthAwarePaginator
    {
        return $this->notificationRepository->getByNotifiableId(
            notifiableId: auth_user_id(),
            filters: $filters,
            authUserId: auth_user_id()
        );
    }

    /**
     * Get unread notification count for current user.
     */
    public function getUnreadCount(string $tab): int
    {
        return $this->notificationRepository->countUnreadByNotifiableId(auth_user_id(), $tab);
    }

    /**
     * Mark one notification as read by UUID for current user.
     *
     * @throws NotFoundException
     */
    public function markAsRead(string $notificationUuid): void
    {
        $notification = $this->notificationRepository->findByUuidAndNotifiableId($notificationUuid, auth_user_id());
        if (empty($notification)) {
            throw new NotFoundException('Notification not found');
        }

        if (! $notification->is_read) {
            $notification->update(['is_read' => true]);
        }
    }

    /**
     * Mark all unread notifications as read for current user.
     */
    public function markAllAsRead(string $tab): int
    {
        return $this->notificationRepository->markAllAsReadByNotifiableId(auth_user_id(), $tab);
    }

    /**
     * Notify target user that someone followed them.
     *
     * @param  int  $actorId  The ID of the user who performed the follow action.
     * @param  int  $notifiableId  The ID of the user to be notified.
     */
    public function notifyFollow(int $actorId, int $notifiableId): void
    {
        if ($actorId === $notifiableId) {
            return;
        }

        $this->notificationRepository->create([
            'actor_id' => $actorId,
            'notifiable_id' => $notifiableId,
            'type' => NotificationTypeEnum::FOLLOW->value,
            'entity_type' => ModelEntityTypeEnum::USER->value,
            'entity_id' => $actorId,
            'data' => null,
        ]);
    }

    /**
     * Notify post owner that their post was liked.
     *
     * @param  int  $actorId  The ID of the user who performed the like action.
     * @param  Post  $post  The post that was liked.
     */
    public function notifyLike(int $actorId, Post $post): void
    {
        $videoPost = $post->getRoot();
        $isLikeOnComment = $post->type === PostTypeEnum::COMMENT;
        $postOwnerId = $post->user_id;
        if ($actorId === $postOwnerId) {
            return;
        }

        $data = [
            'post_uuid' => $videoPost->uuid,
            'liked_target_type' => $isLikeOnComment ? 'comment' : 'post',
            'liked_target_uuid' => $post->uuid,
        ];

        if ($isLikeOnComment) {
            $data['comment_uuid'] = $post->uuid;
            $data['comment_excerpt'] = mb_substr((string) $post->content, 0, self::EXCERPT_LIMIT);
        }

        $this->notificationRepository->create([
            'actor_id' => $actorId,
            'notifiable_id' => $postOwnerId,
            'type' => NotificationTypeEnum::LIKE->value,
            'entity_type' => ModelEntityTypeEnum::POST->value,
            'entity_id' => $videoPost->id,
            'data' => $data,
        ]);
    }

    /**
     * Notify post owner that someone commented on their post.
     */
    public function notifyComment(int $actorId, Post $targetPost, Post $commentPost): void
    {
        $videoPost = $targetPost->getRoot();
        $postOwnerId = $targetPost->user_id;
        if ($actorId === $postOwnerId) {
            return;
        }

        $this->notificationRepository->create([
            'actor_id' => $actorId,
            'notifiable_id' => $postOwnerId,
            'type' => NotificationTypeEnum::COMMENT->value,
            'entity_type' => ModelEntityTypeEnum::POST->value,
            'entity_id' => $videoPost->id,
            'data' => [
                'post_uuid' => $videoPost->uuid,
                'comment_uuid' => $commentPost->uuid,
                'comment_excerpt' => mb_substr((string) $commentPost->content, 0, self::EXCERPT_LIMIT),
            ],
        ]);
    }

    /**
     * Notify mentioned users in post/comment content.
     *
     * @param  array<int, int>  $mentionedUserIds
     */
    public function notifyMention(int $actorId, Post $post, array $mentionedUserIds): void
    {
        $videoPost = $post->getRoot();
        $mentionedUserIds = array_values(array_unique(array_filter($mentionedUserIds, fn ($id) => (int) $id > 0)));

        foreach ($mentionedUserIds as $mentionedUserId) {
            $mentionedUserId = $mentionedUserId;
            if ($actorId === $mentionedUserId) {
                continue;
            }

            $this->notificationRepository->create([
                'actor_id' => $actorId,
                'notifiable_id' => $mentionedUserId,
                'type' => NotificationTypeEnum::MENTION->value,
                'entity_type' => ModelEntityTypeEnum::POST->value,
                'entity_id' => $videoPost->id,
                'data' => [
                    'post_uuid' => $videoPost->uuid,
                    'content_excerpt' => mb_substr((string) $post->content, 0, self::EXCERPT_LIMIT),
                ],
            ]);
        }
    }

    /**
     * Notify current user for authentication-related events.
     *
     * @param  int  $userId  The ID of the user to be notified.
     * @param  string  $eventName  The name of the authentication event (e.g., 'login', 'logout', 'password_change').
     */
    public function notifyAuthEvent(int $userId, string $eventName): void
    {
        $this->notificationRepository->create([
            'actor_id' => null,
            'notifiable_id' => $userId,
            'type' => NotificationTypeEnum::SECURITY->value,
            'entity_type' => ModelEntityTypeEnum::USER->value,
            'entity_id' => $userId,
            'data' => [
                'event' => $eventName,
            ],
        ]);
    }

    /**
     * Notify user about admin moderation actions.
     *
     * @param  array<string,mixed>|null  $data
     */
    public function notifyAdminModerationAction(
        int $adminId,
        int $notifiableUserId,
        ModelEntityTypeEnum $entityType,
        int $entityId,
        ?array $data = null
    ): void {
        if ($adminId === $notifiableUserId) {
            return;
        }

        $this->notificationRepository->create([
            'actor_id' => $adminId,
            'notifiable_id' => $notifiableUserId,
            'type' => NotificationTypeEnum::ADMIN->value,
            'entity_type' => $entityType->value,
            'entity_id' => $entityId,
            'data' => $data,
        ]);
    }
}
