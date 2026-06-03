<?php

namespace App\Repositories;

use App\Models\AiCopilotMessage;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<AiCopilotMessage>
 */
class AiCopilotMessageRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(new AiCopilotMessage());
    }

    /** @return Collection<int, AiCopilotMessage> */
    public function recentBySession(int $sessionId, int $limit = 10): Collection
    {
        return $this->query()
            ->where('session_id', $sessionId)
            ->orderBy('created_at')
            ->limit($limit * 2)   // fetch extra, return last N via collection
            ->get()
            ->takeLast($limit);
    }

    /** @return Collection<int, AiCopilotMessage> */
    public function latestBySession(int $sessionId, int $limit = 20): Collection
    {
        return $this->query()
            ->where('session_id', $sessionId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }

    public function findByUuidOrFail(string $uuid): AiCopilotMessage
    {
        /** @var AiCopilotMessage */
        return $this->query()->where('uuid', $uuid)->firstOrFail();
    }

    public function markAccepted(AiCopilotMessage $message): void
    {
        $message->update(['status' => 'accepted']);
    }

    public function markRejected(AiCopilotMessage $message): void
    {
        $message->update(['status' => 'rejected']);
    }
}
