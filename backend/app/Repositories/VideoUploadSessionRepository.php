<?php

namespace App\Repositories;

use App\Enums\Video\VideoUploadStatusEnum;
use App\Models\VideoUploadSession;
use Illuminate\Database\Eloquent\Collection;

class VideoUploadSessionRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(VideoUploadSession::class));
    }

    /**
     * Find a session by its UUID, or return null if not found.
     *
     * @param  string  $uuid
     * @return VideoUploadSession|null
     */
    public function findByUuid(string $uuid): ?VideoUploadSession
    {
        /** @var VideoUploadSession|null */
        return $this->query()->where('uuid', $uuid)->first();
    }

    /**
     * Find a session by UUID scoped to a specific user, or return null.
     *
     * @param  string  $uuid    The session UUID.
     * @param  int     $userId  The owning user's ID.
     * @return VideoUploadSession|null
     */
    public function findByUuidForUser(string $uuid, int $userId): ?VideoUploadSession
    {
        /** @var VideoUploadSession|null */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Check whether a session UUID belongs to the given user.
     *
     * @param  string  $uuid    The session UUID.
     * @param  int     $userId  The user's ID.
     * @return bool
     */
    public function isUuidOwnedByUser(string $uuid, int $userId): bool
    {
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Resolve a set of session UUIDs to a [uuid => upload_file_id] map.
     * Only sessions that have a completed upload_file_id are included.
     *
     * @param  array<int, string>  $uuids  List of session UUIDs.
     * @return array<string, int>          Map of uuid => upload_file_id.
     */
    public function getFileIdsByUuids(array $uuids): array
    {
        if (empty($uuids)) {
            return [];
        }

        return $this->query()
            ->whereIn('uuid', $uuids)
            ->whereNotNull('upload_file_id')
            ->pluck('upload_file_id', 'uuid')
            ->toArray();
    }

    /**
     * Find sessions that are expired or have been stale for more than $hours hours,
     * excluding those already in a terminal state (READY or CANCELED).
     *
     * @param  int  $hours  Inactivity threshold in hours.
     * @return Collection<int, VideoUploadSession>
     */
    public function findAbandonedSessions(int $hours = 24): Collection
    {
        return $this->query()
            ->whereNotIn('status', [
                VideoUploadStatusEnum::READY->value,
                VideoUploadStatusEnum::CANCELED->value,
            ])
            ->where(function ($q) use ($hours) {
                $q->where('expires_at', '<', now())
                  ->orWhere('updated_at', '<', now()->subHours($hours));
            })
            ->get();
    }
}
