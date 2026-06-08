<?php

namespace App\Repositories;

use App\Models\AiCopilotSession;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * @extends BaseRepository<AiCopilotSession>
 */
class AiCopilotSessionRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(AiCopilotSession::class));
    }

    /**
     * Find a session by UUID for a specific user or fail.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return AiCopilotSession
     */
    public function findByUuidAndUserOrFail(string $uuid, int $userId): AiCopilotSession
    {
        /** @var AiCopilotSession */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->firstOrFail();
    }

    /**
     * Find an active session for a user's upload session.
     *
     * @param  int  $userId
     * @param  string  $uploadSessionUuid
     * @return AiCopilotSession|null
     */
    public function findActiveByUploadSession(int $userId, string $uploadSessionUuid): ?AiCopilotSession
    {
        /** @var AiCopilotSession|null */
        return $this->query()
            ->where('user_id', $userId)
            ->where('upload_session_uuid', $uploadSessionUuid)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest()
            ->first();
    }

    /**
     * Find an active session for a user's post.
     *
     * @param  int  $userId
     * @param  int  $postId
     * @return AiCopilotSession|null
     */
    public function findActiveByPost(int $userId, int $postId): ?AiCopilotSession
    {
        /** @var AiCopilotSession|null */
        return $this->query()
            ->where('user_id', $userId)
            ->where('post_id', $postId)
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->latest()
            ->first();
    }

    /**
     * Paginate sessions for the admin panel.
     *
     * @param  int  $perPage
     * @return LengthAwarePaginator
     */
    public function paginateForAdmin(int $perPage = 20): LengthAwarePaginator
    {
        return $this->query()
            ->with('user:id,uuid,username')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
