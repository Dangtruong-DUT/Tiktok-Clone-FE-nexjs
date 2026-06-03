<?php

namespace App\Repositories;

use App\Models\AiCopilotSession;

/**
 * @extends BaseRepository<AiCopilotSession>
 */
class AiCopilotSessionRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new AiCopilotSession());
    }

    public function findByUuidAndUserOrFail(string $uuid, int $userId): AiCopilotSession
    {
        /** @var AiCopilotSession */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('user_id', $userId)
            ->firstOrFail();
    }

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
}
