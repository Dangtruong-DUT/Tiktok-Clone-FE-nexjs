<?php

namespace App\Repositories;

use App\Enums\Notification\NotificationTabEnum;
use App\Models\Hashtag;
use App\Models\Notification;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class NotificationRepository extends BaseRepository
{
    public function __construct()
    {
        $modelInstance = app()->make(Notification::class);
        parent::__construct($modelInstance);
    }

    /**
     * Check if a notification exists by UUID
     *
     * @param  string  $uuid
     * @return bool
     */
    public function isExistByUuid(string $uuid): bool
    {
        return $this->query()->where('uuid', $uuid)->exists();
    }

    /**
     * Get notifications for one user with tab filtering.
     *
     * @param  int  $notifiableId
     * @param  array<string, mixed>  $filters
     * @param  int|null  $authUserId
     * @return LengthAwarePaginator
     */
    public function getByNotifiableId(int $notifiableId, array $filters, ?int $authUserId): LengthAwarePaginator
    {
        $filterCollection = collect($filters);
        $query = $this->query()
            ->ofNotifiable($notifiableId)
            ->ofTypeByTab($filterCollection->get('tab', NotificationTabEnum::ALL->value))
            ->with([
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
            ])
            ->orderByDesc('created_at');

        $perPage = (int) $filterCollection->get('per_page', config('const.pagination.default_per_page', 10));

        return $query->paginate($perPage);
    }

    /**
     * Count unread notifications for one user by tab.
     *
     * @param  int  $notifiableId
     * @param  string  $tab
     * @return int
     */
    public function countUnreadByNotifiableId(int $notifiableId, string $tab = NotificationTabEnum::ALL->value): int
    {
        $query = $this->query()
            ->ofNotifiable($notifiableId)
            ->where('is_read', false)
            ->ofTypeByTab($tab);

        return $query->count();
    }

    /**
     * Mark all unread notifications as read for one user by tab.
     *
     * @param  int  $notifiableId
     * @param  string  $tab
     * @return int
     */
    public function markAllAsReadByNotifiableId(int $notifiableId, string $tab = NotificationTabEnum::ALL->value): int
    {
        $query = $this->query()
            ->ofNotifiable($notifiableId)
            ->where('is_read', false)
            ->ofTypeByTab($tab);

        return $query->update(['is_read' => true]);
    }

    /**
     * Find one notification by UUID, scoped to one user.
     *
     * @param  string  $uuid
     * @param  int  $notifiableId
     * @return Notification|null
     */
    public function findByUuidAndNotifiableId(string $uuid, int $notifiableId): ?Notification
    {
        return $this->query()
            ->ofNotifiable($notifiableId)
            ->where('uuid', $uuid)
            ->first();
    }
}
