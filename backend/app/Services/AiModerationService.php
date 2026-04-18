<?php

namespace App\Services;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Admin\AdminResourceEnum;
use App\Enums\Notification\EntityTypeEnum;
use App\Models\AiModerationReport;
use App\Models\Post;
use App\Models\User;
use App\Repositories\PostRepository;
use App\Services\Admin\AdminModerationNoticeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Junges\Kafka\Facades\Kafka;

class AiModerationService
{
    /**
     * AiModerationService constructor.
     */
    public function __construct(
        private readonly AdminModerationNoticeService $adminModerationNoticeService,
        private readonly PostRepository $postRepo
    ) {}

    /**
     * Enqueue post/comment content to AI moderation queue.
     * @param Post $post
     * @return void
     */
    public function enqueue(Post $post): void
    {
        if (!config('services.ai_moderation.enabled')) {
            return;
        }

        $content = trim((string) $post->content);
        if ($content === '') {
            return;
        }

        $topic = (string) config('services.ai_moderation.kafka.request_topic', 'moderation.request.v1');
        $broker = (string) config('services.ai_moderation.kafka.bootstrap_servers', 'kafka:29092');

        $payload = [
            'task_id' => (string) Str::uuid(),
            'resource_type' => $post->type,
            'resource_id' => (int) $post->id,
            'resource_uuid' => (string) $post->uuid,
            'user_id' => (int) $post->user_id,
            'sentence' => $content,
            'reason' => null,
            'enqueued_at' => now()->toIso8601String(),
        ];

        try {
            Kafka::publish($broker)
                ->onTopic($topic)
                ->withKafkaKey((string) $post->uuid)
                ->withBody($payload)
                ->send();
        } catch (\Throwable $exception) {
            Log::error('Failed to enqueue AI moderation request', [
                'post_id' => $post->id,
                'topic' => $topic,
                'broker' => $broker,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Apply verdict sent from AI worker and trigger moderation effects.
     * @param array<string,mixed> $payload
     *                  - task_id,
     *                  - resource_type
     *                  - resource_id
     *                  - resource_uuid
     *                  - user_id
     *                  - sentence
     *                  - label
     *                  - confidence
     *                  - reason
     *                  - moderated_at
     *                  - raw_payload
     * @return void
     */
    public function applyVerdict(array $payload): void
    {
        $isViolation = (bool) ($payload['is_violation'] ?? false);
        if (!$isViolation) {
            return;
        }

        $post = $this->postRepo->find((int) $payload['resource_id']);

        if (!$post ||$post->hidden_at !== null || $post->deleted_at !== null) {
            return;
        }

        $appealDays = (int) config('services.ai_moderation.appeal_window_days', 7);
        $reason = (string) ($payload['reason'] ?? 'Violated community standards by automated moderation.');
        $resourceType = (string) ($payload['resource_type'] ?? AdminResourceEnum::POST->value);

        DB::transaction(function () use ($payload, $post, $appealDays, $reason, $resourceType): void {
            $post->update([
                'hidden_at' => now(),
                'hidden_reason' => $reason,
            ]);

            AiModerationReport::updateOrCreate(
                ['task_id' => (string) $payload['task_id']],
                [
                    'user_id' => (int) $post->user_id,
                    'resource_type' => $resourceType,
                    'resource_id' => (int) $post->id,
                    'resource_uuid' => (string) ($payload['resource_uuid'] ?? $post->uuid),
                    'sentence' => (string) ($payload['sentence'] ?? $post->content),
                    'label' => (int) ($payload['label'] ?? 1),
                    'confidence' => (float) ($payload['confidence'] ?? 0),
                    'is_violation' => true,
                    'violation_reason' => $reason,
                    'raw_payload' => $payload['raw_payload'] ?? $payload,
                    'moderated_at' => $payload['moderated_at'] ?? now(),
                    'appeal_deadline_at' => now()->addDays($appealDays),
                    'status' => 'open',
                ]
            );

            $systemAdmin = $this->resolveSystemAdmin();
            if (!$systemAdmin) {
                return;
            }

            $this->adminModerationNoticeService->send(
                admin: $systemAdmin,
                targetUser: $post->user,
                action: AdminActionEnum::HIDE_POST,
                reason: $reason,
                entityType: EntityTypeEnum::POST,
                entityId: $post->id,
                context: [
                    'resource_type' => $resourceType,
                    'resource_id' => $post->id,
                ]
            );
        });
    }

    /**
     * Resolve system admin actor for automatic moderation notices.
     * @return User|null
     */
    private function resolveSystemAdmin(): ?User
    {
        $adminId = (int) config('');

        $admin = User::query()->find($adminId);
        if ($admin) {
            return $admin;
        }

        return User::query()->orderBy('id')->first();
    }
}
