<?php

namespace App\Repositories;

use App\Enums\Ai\AiCopilotMessageStatusEnum;
use App\Models\AiCopilotMessage;
use Illuminate\Database\Eloquent\Collection;

/**
 * @extends BaseRepository<AiCopilotMessage>
 */
class AiCopilotMessageRepository extends BaseRepository
{
    public function __construct()
    {
        parent::__construct(app()->make(AiCopilotMessage::class));
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
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
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
     * Find a message by UUID with session ownership pre-loaded (avoids N+1 on ownership check).
     *
     * @param  string  $uuid
     * @return AiCopilotMessage
     */
    public function findByUuidWithSession(string $uuid): AiCopilotMessage
    {
        /** @var AiCopilotMessage */
        return $this->query()
            ->with('session:id,user_id')
            ->where('uuid', $uuid)
            ->firstOrFail();
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
        $this->query()->whereKey($message->id)->update(['status' => AiCopilotMessageStatusEnum::ACCEPTED->value]);
    }

    /**
     * Mark a copilot message as rejected.
     *
     * @param  AiCopilotMessage  $message
     * @return void
     */
    public function markRejected(AiCopilotMessage $message): void
    {
        $this->query()->whereKey($message->id)->update(['status' => AiCopilotMessageStatusEnum::REJECTED->value]);
    }
}
