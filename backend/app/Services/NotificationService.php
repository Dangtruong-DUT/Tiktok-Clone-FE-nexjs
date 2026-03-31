<?php

namespace App\Services;

use App\Enums\Notification\EntityTypeEnum;
use App\Enums\Notification\NotificationTypeEnum;
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
     * @param array<string, mixed> $filters
     */
    public function getMyNotifications(array $filters): LengthAwarePaginator
    {
        return $this->notificationRepository->paginateByNotifiableId(
            notifiableId: auth_user_id(),
            filters: $filters,
            authUserId: auth_user_id()
        );
    }

    /**
     * Get unread notification count for current user.
     */
    public function getMyUnreadCount(string $tab = 'all'): int
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

        if (!$notification->is_read) {
            $notification->update(['is_read' => true]);
        }
    }

    /**
     * Mark all unread notifications as read for current user.
     */
    public function markAllAsRead(string $tab = 'all'): int
    {
        return $this->notificationRepository->markAllAsReadByNotifiableId(auth_user_id(), $tab);
    }

    /**
     * Notify target user that someone followed them.
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
            'entity_type' => EntityTypeEnum::USER->value,
            'entity_id' => $actorId,
            'data' => null,
        ]);
    }

    /**
     * Notify post owner that their post was liked.
     */
    public function notifyLike(int $actorId, Post $post): void
    {
        $postOwnerId = (int) $post->user_id;
        if ($actorId === $postOwnerId) {
            return;
        }

        $this->notificationRepository->create([
            'actor_id' => $actorId,
            'notifiable_id' => $postOwnerId,
            'type' => NotificationTypeEnum::LIKE->value,
            'entity_type' => EntityTypeEnum::POST->value,
            'entity_id' => $post->id,
            'data' => [
                'post_uuid' => $post->uuid,
            ],
        ]);
    }

    /**
     * Notify post owner that someone commented on their post.
     */
    public function notifyComment(int $actorId, Post $targetPost, Post $commentPost): void
    {
        $postOwnerId = (int) $targetPost->user_id;
        if ($actorId === $postOwnerId) {
            return;
        }

        $this->notificationRepository->create([
            'actor_id' => $actorId,
            'notifiable_id' => $postOwnerId,
            'type' => NotificationTypeEnum::COMMENT->value,
            'entity_type' => EntityTypeEnum::POST->value,
            'entity_id' => $targetPost->id,
            'data' => [
                'post_uuid' => $targetPost->uuid,
                'comment_uuid' => $commentPost->uuid,
                'comment_excerpt' => mb_substr((string) $commentPost->content, 0, self::EXCERPT_LIMIT),
            ],
        ]);
    }

    /**
     * Notify mentioned users in post/comment content.
     *
     * @param array<int, int> $mentionedUserIds
     */
    public function notifyMention(int $actorId, Post $post, array $mentionedUserIds): void
    {
        $mentionedUserIds = array_values(array_unique(array_filter($mentionedUserIds, fn ($id) => (int) $id > 0)));

        foreach ($mentionedUserIds as $mentionedUserId) {
            $mentionedUserId = (int) $mentionedUserId;
            if ($actorId === $mentionedUserId) {
                continue;
            }

            $this->notificationRepository->create([
                'actor_id' => $actorId,
                'notifiable_id' => $mentionedUserId,
                'type' => NotificationTypeEnum::MENTION->value,
                'entity_type' => EntityTypeEnum::POST->value,
                'entity_id' => $post->id,
                'data' => [
                    'post_uuid' => $post->uuid,
                    'content_excerpt' => mb_substr((string) $post->content, 0, self::EXCERPT_LIMIT),
                ],
            ]);
        }
    }

    /**
     * Notify current user for authentication-related events.
     */
    public function notifyAuthEvent(int $userId, string $eventName): void
    {
        $this->notificationRepository->create([
            'actor_id' => null,
            'notifiable_id' => $userId,
            'type' => NotificationTypeEnum::SECURITY->value,
            'entity_type' => EntityTypeEnum::USER->value,
            'entity_id' => $userId,
            'data' => [
                'event' => $eventName,
            ],
        ]);
    }
}
