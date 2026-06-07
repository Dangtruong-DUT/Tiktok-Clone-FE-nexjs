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

    /**
     * Get recent messages for a session, preserving chronological order.
     *
     * @param  int  $sessionId
     * @param  int  $limit
     * @return Collection<int, AiCopilotMessage>
     */
    public function recentBySession(int $sessionId, int $limit = 10): Collection
    {
        return $this->query()
            ->where('session_id', $sessionId)
            ->orderBy('created_at')
            ->limit($limit * 2)   // fetch extra, return last N via collection
            ->get()
            ->take(-$limit);
    }

    /**
     * Get the latest messages for a session in chronological order.
     *
     * @param  int  $sessionId
     * @param  int  $limit
     * @return Collection<int, AiCopilotMessage>
     */
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

    /**
     * Find a copilot message by UUID or fail.
     *
     * @param  string  $uuid
     * @return AiCopilotMessage
     */
    public function findByUuidOrFail(string $uuid): AiCopilotMessage
    {
        /** @var AiCopilotMessage */
        return $this->query()->where('uuid', $uuid)->firstOrFail();
    }

    /**
     * Find a message by UUID scoped to a specific session, or return null.
     *
     * @param  string  $uuid
     * @param  int  $sessionId
     * @return AiCopilotMessage|null
     */
    public function findByUuidAndSession(string $uuid, int $sessionId): ?AiCopilotMessage
    {
        /** @var AiCopilotMessage|null */
        return $this->query()
            ->where('uuid', $uuid)
            ->where('session_id', $sessionId)
            ->first();
    }

    /**
     * Mark a copilot message as accepted.
     *
     * @param  AiCopilotMessage  $message
     * @return void
     */
    public function markAccepted(AiCopilotMessage $message): void
    {
        $this->query()->whereKey($message->id)->update(['status' => 'accepted']);
    }

    /**
     * Mark a copilot message as rejected.
     *
     * @param  AiCopilotMessage  $message
     * @return void
     */
    public function markRejected(AiCopilotMessage $message): void
    {
        $this->query()->whereKey($message->id)->update(['status' => 'rejected']);
    }
}
