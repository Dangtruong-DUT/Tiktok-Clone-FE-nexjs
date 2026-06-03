<?php

namespace App\Services\AI\Schedule;

use App\Enums\Ai\ScheduledPostSourceEnum;
use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Enums\Post\PostPublishStatusEnum;
use App\Exceptions\http\BadRequestException;
use App\Models\Post;
use App\Models\ScheduledPost;
use App\Repositories\ScheduledPostRepository;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class PostScheduleService
{
    public function __construct(
        private readonly ScheduledPostRepository $scheduledPostRepository,
    ) {}

    public function schedulePost(Post $post, int $userId, string $scheduledAtInput, string $timezone): ScheduledPost
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

        // scheduled_at is sent as UTC ISO from frontend — parse without timezone interpretation
        $scheduledAt = Carbon::parse($scheduledAtInput)->utc();

        if ($scheduledAt->isPast()) {
            throw new BadRequestException('Scheduled time must be in the future.');
        }

        $post->update(['status' => PostPublishStatusEnum::SCHEDULED]);

        /** @var ScheduledPost */
        return $this->scheduledPostRepository->create([
            'uuid'          => (string) Str::uuid(),
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

    public function reschedule(ScheduledPost $scheduledPost, int $userId, string $scheduledAtInput, string $timezone): ScheduledPost
    {
        if ($scheduledPost->user_id !== $userId) {
            throw new BadRequestException('You do not own this scheduled post.');
        }

        if ($scheduledPost->status !== ScheduledPostStatusEnum::PENDING) {
            throw new BadRequestException('Only pending schedules can be rescheduled.');
        }

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

    public function paginateForUser(int $userId, int $perPage): LengthAwarePaginator
    {
        return $this->scheduledPostRepository->paginateByUser($userId, $perPage);
    }
}
