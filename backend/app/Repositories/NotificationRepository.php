<?php

namespace App\Repositories;

use App\Enums\Notification\NotificationTypeEnum;
use App\Models\Hashtag;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class NotificationRepository extends BaseRepository
{
    /**
     * @var array<string, array<int, int>>
     */
    private const TAB_TO_TYPES = [
        'likes' => [NotificationTypeEnum::LIKE->value],
        'comments' => [NotificationTypeEnum::COMMENT->value],
        'mentions' => [NotificationTypeEnum::MENTION->value],
        'followers' => [NotificationTypeEnum::FOLLOW->value],
    ];

    public function __construct()
    {
        $modelInstance = app()->make(Notification::class);
        parent::__construct($modelInstance);
    }

    /**
     * Paginate notifications for one user with tab filtering.
     *
     * @param array<string, mixed> $filters
     * @param int|null $authUserId
     */
    public function paginateByNotifiableId(int $notifiableId, array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $query = $this->queryForUser($notifiableId);

        $this->applyTabFilter($query, (string) $filterCollection->get('tab', 'all'));

        $query->with([
            'actor' => function ($actorQuery) use ($authUserId): void {
                $actorQuery
                    ->select('users.*')
                    ->with('avatarFile')
                    ->withExists([
                        'followers as is_followed' => fn ($relationQuery) => $relationQuery->whereKey($authUserId),
                    ]);
            },
            'entity' => function (MorphTo $morphTo): void {
                $morphTo->morphWith([
                    Post::class => ['thumbnailFile'],
                    User::class => ['avatarFile'],
                    Hashtag::class => [],
                ]);
            },
        ])->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $query->paginate($perPage);
    }

    /**
     * Count unread notifications for one user by tab.
     */
    public function countUnreadByNotifiableId(int $notifiableId, string $tab = 'all'): int
    {
        $query = $this->queryForUser($notifiableId)
            ->where('is_read', false);

        $this->applyTabFilter($query, $tab);

        return (int) $query->count();
    }

    /**
     * Mark all unread notifications as read for one user by tab.
     */
    public function markAllAsReadByNotifiableId(int $notifiableId, string $tab = 'all'): int
    {
        $query = $this->queryForUser($notifiableId)
            ->where('is_read', false);

        $this->applyTabFilter($query, $tab);

        return $query->update(['is_read' => true]);
    }

    /**
     * Find one notification by UUID, scoped to one user.
     */
    public function findByUuidAndNotifiableId(string $uuid, int $notifiableId): ?Notification
    {
        return $this->queryForUser($notifiableId)
            ->where('uuid', $uuid)
            ->first();
    }

    /**
     * Base query scoped by notification receiver.
     */
    private function queryForUser(int $notifiableId): Builder
    {
        return $this->query()->where('notifiable_id', $notifiableId);
    }

    /**
     * Apply tab-to-type filter when tab is supported.
     */
    private function applyTabFilter(Builder $query, string $tab): void
    {
        $tab = strtolower(trim($tab));

        if (!isset(self::TAB_TO_TYPES[$tab])) {
            return;
        }

        $query->whereIn('type', self::TAB_TO_TYPES[$tab]);
    }
}
