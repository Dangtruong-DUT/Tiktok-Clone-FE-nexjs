<?php

namespace App\Services;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Ai\AiModerationLabelEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Models\AiModerationReport;
use App\Models\Post;
use App\Repositories\PostRepository;
use App\Repositories\UserRepository;
use App\Services\Admin\AdminModerationNoticeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Junges\Kafka\Facades\Kafka;

class AiModerationService
{
    /**
     * Create a new service instance.
     *
     * @param  AdminModerationNoticeService  $adminModerationNoticeService
     * @param  PostRepository  $postRepository
     * @param  UserRepository  $userRepository
     */
    public function __construct(
        private readonly AdminModerationNoticeService $adminModerationNoticeService,
        private readonly PostRepository $postRepository,
        private readonly UserRepository $userRepository
    ) {}

    /**
     * Enqueue post/comment content to AI moderation queue.
     */
    public function enqueue(Post $post): void
    {
        if (! config('services.ai_moderation.enabled')) {
            return;
        }

        $content = trim((string) $post->content);
        $resourceType = ResourceTypeEnum::tryFromPostType($post->type) ?? ResourceTypeEnum::POST;
        if ($content === '') {
            return;
        }

        $topic = (string) config('services.ai_moderation.kafka.request_topic', 'moderation.request.v1');
        $broker = (string) config('services.ai_moderation.kafka.bootstrap_servers', 'kafka:29092');
        $payload = [
            'task_id' => (string) Str::uuid(),
            'resource_type' => $resourceType->value,
            'resource_id' => (int) $post->id,
            'resource_updated_at' => $post->updated_at->toDateTimeString(),
            'user_id' => (int) $post->user_id,
            'sentence' => $content,
            'reason' => null,
            'enqueued_at' => now()->toDateTimeString(),
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
     * @param  array<string,mixed>  $payload
     */
    public function applyVerdict(array $payload): void
    {
        $post = $this->postRepository->find((int) $payload['resource_id']);

        if (! $post) {
            return;
        }

        $resourceUpdatedAt = $payload['resource_updated_at'] ?? null;
        if ($resourceUpdatedAt && check_version_conflict($post, $resourceUpdatedAt)) {
            return;
        }

        $isViolation = (bool) ($payload['is_violation'] ?? false);
        $appealDays = (int) config('services.ai_moderation.appeal_window_days', 7);
        $reason = (string) ($payload['reason'] ?? 'Violated community standards by automated moderation.');
        $resourceType = ResourceTypeEnum::tryFrom((string) ($payload['resource_type'] ?? 'post')) ?? ResourceTypeEnum::POST;
        $adminAction = $resourceType === ResourceTypeEnum::COMMENT
            ? AdminActionEnum::DELETE_COMMENT
            : AdminActionEnum::DELETE_POST;

        $label = AiModerationLabelEnum::tryFrom((int) ($payload['label'] ?? 1)) ?? AiModerationLabelEnum::TOXIC;

        DB::transaction(function () use (
            $payload,
            $post,
            $appealDays,
            $reason,
            $resourceType,
            $adminAction,
            $isViolation,
            $label): void {
            AiModerationReport::updateOrCreate(
                ['task_id' => (string) $payload['task_id']],
                [
                    'user_id' => (int) $post->user_id,
                    'resource_type' => $resourceType->value,
                    'resource_id' => (int) $post->id,
                    'sentence' => (string) ($payload['sentence'] ?? $post->content),
                    'label' => $label->value,
                    'confidence' => (float) ($payload['confidence'] ?? 0),
                    'is_violation' => $isViolation,
                    'violation_reason' => $isViolation ? $reason : null,
                    'raw_payload' => $payload['raw_payload'] ?? $payload,
                    'moderated_at' => $payload['moderated_at'] ?? now(),
                    'appeal_deadline_at' => $isViolation ? now()->addDays($appealDays) : null,
                    'status' => $isViolation ? 'open' : 'resolved',
                ]
            );

            if ($isViolation) {
                $post->delete();
                $systemAdmin = $this->userRepository->getSuperAdmin();
                if (! $systemAdmin) {
                    return;
                }
                $this->adminModerationNoticeService->send(
                    admin: $systemAdmin,
                    targetUser: $post->user,
                    action: $adminAction,
                    reason: $reason,
                    entityType: ModelEntityTypeEnum::POST,
                    entityId: $post->id,
                    context: [
                        'resource_type' => $resourceType->value,
                        'resource_id' => $post->id,
                        'resource_uuid' => $post->uuid,
                    ]
                );
            }
        });
    }
}
