<?php

namespace App\Services\AI\Schedule;

use App\Enums\Ai\ScheduledPostSourceEnum;
use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Enums\Post\PostPublishStatusEnum;
use App\Exceptions\http\BadRequestException;
use App\Models\Post;
use App\Models\ScheduledPost;
use App\Repositories\PostRepository;
use App\Repositories\ScheduledPostRepository;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;

class PostScheduleService
{
    /**
     * Create a new service instance.
     *
     * @param  PostRepository  $postRepository
     * @param  ScheduledPostRepository  $scheduledPostRepository
     */
    public function __construct(
        private readonly PostRepository $postRepository,
        private readonly ScheduledPostRepository $scheduledPostRepository,
    ) {}

    /**
     * @param  array<string,mixed>  $payload
     */
    public function schedulePostByUuid(string $postUuid, int $userId, array $payload): ScheduledPost
    {
        $post = $this->postRepository->findByUuidAndUserOrFail($postUuid, $userId);

        return $this->schedulePost($post, $userId, $payload);
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function schedulePost(Post $post, int $userId, array $payload): ScheduledPost
    {
        if ($post->user_id !== $userId) {
            throw new BadRequestException('You do not own this post.');
        }

        if (! in_array($post->status, [PostPublishStatusEnum::DRAFT, PostPublishStatusEnum::FAILED], true)) {
            throw new BadRequestException('Only draft or failed posts can be scheduled.');
        }

        if ($this->scheduledPostRepository->findByPostForUser($post->id, $userId)) {
            throw new BadRequestException('This post is already scheduled. Cancel the existing schedule first.');
        }

        $scheduledAtInput = (string) $payload['scheduled_at'];
        $timezone = (string) ($payload['timezone'] ?? 'UTC');

        // scheduled_at is sent as UTC ISO from frontend — parse without timezone interpretation
        $scheduledAt = Carbon::parse($scheduledAtInput)->utc();

        if ($scheduledAt->isPast()) {
            throw new BadRequestException('Scheduled time must be in the future.');
        }

        $post->update(['status' => PostPublishStatusEnum::SCHEDULED]);

        /** @var ScheduledPost */
        return $this->scheduledPostRepository->create([
            'user_id'       => $userId,
            'post_id'       => $post->id,
            'scheduled_at'  => $scheduledAt,
            'user_timezone' => $timezone,
            'status'        => ScheduledPostStatusEnum::PENDING,
            'source'        => ScheduledPostSourceEnum::MANUAL,
        ]);
    }

    public function cancelSchedule(ScheduledPost $scheduledPost, int $userId): ScheduledPost
    {
        if ($scheduledPost->user_id !== $userId) {
            throw new BadRequestException('You do not own this scheduled post.');
        }

        if ($scheduledPost->status !== ScheduledPostStatusEnum::PENDING) {
            throw new BadRequestException('Only pending schedules can be cancelled.');
        }

        $scheduledPost->post->update(['status' => PostPublishStatusEnum::DRAFT]);

        /** @var ScheduledPost */
        return $this->scheduledPostRepository->update($scheduledPost->id, [
            'status' => ScheduledPostStatusEnum::CANCELLED,
        ]);
    }

    public function publishNow(Post $post, int $userId): Post
    {
        if ($post->user_id !== $userId) {
            throw new BadRequestException('You do not own this post.');
        }

        if (! in_array($post->status, [
            PostPublishStatusEnum::DRAFT,
            PostPublishStatusEnum::SCHEDULED,
            PostPublishStatusEnum::FAILED,
        ], true)) {
            throw new BadRequestException('Post cannot be published in its current state.');
        }

        // Cancel any existing pending schedule
        $existing = $this->scheduledPostRepository->findByPostForUser($post->id, $userId);
        if ($existing) {
            $this->scheduledPostRepository->update($existing->id, [
                'status'       => ScheduledPostStatusEnum::CANCELLED,
                'published_at' => now(),
            ]);
        }

        $post->update([
            'status'       => PostPublishStatusEnum::PUBLISHED,
            'published_at' => now(),
        ]);

        return $post->fresh();
    }

    public function publishNowByUuid(string $postUuid, int $userId): Post
    {
        $post = $this->postRepository->findByUuidAndUserOrFail($postUuid, $userId);

        return $this->publishNow($post, $userId);
    }

    /** Called by PublishScheduledPostJob — transitions to published. */
    public function executePublish(ScheduledPost $scheduledPost): void
    {
        $post = $scheduledPost->post;

        if (! $post || $post->trashed() || $post->user_id !== $scheduledPost->user_id) {
            $this->scheduledPostRepository->update($scheduledPost->id, [
                'status'        => ScheduledPostStatusEnum::FAILED,
                'error_message' => 'Post no longer exists or belongs to a different user.',
            ]);

            return;
        }

        $post->update([
            'status'       => PostPublishStatusEnum::PUBLISHED,
            'published_at' => now(),
        ]);

        $this->scheduledPostRepository->update($scheduledPost->id, [
            'status'       => ScheduledPostStatusEnum::PUBLISHED,
            'published_at' => now(),
        ]);
    }

    public function markFailed(ScheduledPost $scheduledPost, string $reason): void
    {
        $scheduledPost->post?->update(['status' => PostPublishStatusEnum::FAILED]);

        $this->scheduledPostRepository->update($scheduledPost->id, [
            'status'        => ScheduledPostStatusEnum::FAILED,
            'error_message' => mb_substr($reason, 0, 500),
        ]);
    }

    /**
     * @param  array<string,mixed>  $payload
     */
    public function reschedule(ScheduledPost $scheduledPost, int $userId, array $payload): ScheduledPost
    {
        if ($scheduledPost->user_id !== $userId) {
            throw new BadRequestException('You do not own this scheduled post.');
        }

        if ($scheduledPost->status !== ScheduledPostStatusEnum::PENDING) {
            throw new BadRequestException('Only pending schedules can be rescheduled.');
        }

        $scheduledAtInput = (string) $payload['scheduled_at'];
        $timezone = (string) ($payload['timezone'] ?? 'UTC');

        // scheduled_at is sent as UTC ISO from frontend — parse without timezone interpretation
        $scheduledAt = Carbon::parse($scheduledAtInput)->utc();

        if ($scheduledAt->isPast()) {
            throw new BadRequestException('Scheduled time must be in the future.');
        }

        /** @var ScheduledPost */
        return $this->scheduledPostRepository->update($scheduledPost->id, [
            'scheduled_at'  => $scheduledAt,
            'user_timezone' => $timezone,
        ]);
    }

    public function findByUuidForUser(string $uuid, int $userId): ScheduledPost
    {
        return $this->scheduledPostRepository->findByUuidAndUserOrFail($uuid, $userId);
    }

    /** @param  array<string,mixed>  $filters */
    public function paginateForUser(int $userId, array $filters = []): LengthAwarePaginator
    {
        return $this->scheduledPostRepository->paginateByUser($userId, (int) ($filters['per_page'] ?? 15));
    }

    /**
     * @param  array<string,mixed>  $filters
     */
    public function paginateStudioPostsForUser(int $userId, array $filters = []): LengthAwarePaginator
    {
        return $this->postRepository->paginateForStudioUser(
            userId: $userId,
            perPage: (int) ($filters['per_page'] ?? 20),
            status: isset($filters['status']) && $filters['status'] !== '' ? (string) $filters['status'] : null,
            search: trim((string) ($filters['q'] ?? '')),
            hasScheduleFilter: array_key_exists('has_schedule', $filters),
            hasSchedule: (bool) ($filters['has_schedule'] ?? false),
        );
    }
}
