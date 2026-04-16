<?php

namespace App\Services;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Admin\AdminResourceEnum;
use App\Enums\Notification\EntityTypeEnum;
use App\Models\AiModerationReport;
use App\Models\Post;
use App\Models\User;
use App\Services\Admin\AdminModerationNoticeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiModerationService
{
    /**
     * AiModerationService constructor.
     */
    public function __construct(
        private readonly AdminModerationNoticeService $adminModerationNoticeService,
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

        $resourceType = $post->parent_id ? AdminResourceEnum::COMMENT->value : AdminResourceEnum::POST->value;
        $baseUrl = rtrim((string) config('services.ai_moderation.base_url'), '/');
        $apiKey = (string) config('services.ai_moderation.api_key');
        $timeout = (int) config('services.ai_moderation.timeout_seconds', 3);

        $headers = [];
        if ($apiKey !== '') {
            $headers['X-Moderation-Api-Key'] = $apiKey;
        }

        try {
            $response = Http::timeout($timeout)
                ->withHeaders($headers)
                ->post($baseUrl . '/moderation/enqueue', [
                    'resource_type' => $resourceType,
                    'resource_id' => $post->id,
                    'resource_uuid' => $post->uuid,
                    'user_id' => $post->user_id,
                    'sentence' => $content,
                ]);

            if ($response->failed()) {
                Log::warning('Failed to enqueue AI moderation task', [
                    'post_id' => $post->id,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);
            }
        } catch (\Throwable $exception) {
            Log::warning('AI moderation enqueue error', [
                'post_id' => $post->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Apply verdict sent from AI worker and trigger moderation effects.
     * @param array<string,mixed> $payload
     * @return void
     */
    public function applyVerdict(array $payload): void
    {
        $isViolation = (bool) ($payload['is_violation'] ?? false);
        if (!$isViolation) {
            return;
        }

        $post = Post::query()->find((int) $payload['resource_id']);
        if (!$post) {
            Log::warning('AI moderation verdict resource not found', [
                'resource_id' => $payload['resource_id'] ?? null,
                'task_id' => $payload['task_id'] ?? null,
            ]);
            return;
        }

        if ($post->hidden_at !== null || $post->deleted_at !== null) {
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
        $adminId = (int) config('services.ai_moderation.system_admin_user_id', 1);

        $admin = User::query()->find($adminId);
        if ($admin) {
            return $admin;
        }

        return User::query()->orderBy('id')->first();
    }
}
