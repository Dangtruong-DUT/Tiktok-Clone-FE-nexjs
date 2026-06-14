<?php

namespace App\Services\Post;

use App\Enums\Ai\ScheduledPostSourceEnum;
use App\Enums\Ai\ScheduledPostStatusEnum;
use App\Enums\Post\PostPublishStatusEnum;
use App\Exceptions\http\BadRequestException;
use App\Exceptions\http\ForbiddenException;
use App\Models\Post;
use App\Models\ScheduledPost;
use App\Repositories\PostRepository;
use App\Repositories\ScheduledPostRepository;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

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
            throw new ForbiddenException(trans('exceptions.schedule.forbidden_post'));
        }

        if (! in_array($post->status, [PostPublishStatusEnum::DRAFT, PostPublishStatusEnum::FAILED], true)) {
            throw new BadRequestException(trans('exceptions.schedule.invalid_status'));
        }

        if ($this->scheduledPostRepository->findByPostForUser($post->id, $userId)) {
            throw new BadRequestException(trans('exceptions.schedule.already_scheduled'));
        }

        $scheduledAtInput = (string) $payload['scheduled_at'];

        // scheduled_at is treated as an absolute UTC timestamp.
        $scheduledAt = Carbon::parse($scheduledAtInput, 'UTC');

        if ($scheduledAt->isPast()) {
            throw new BadRequestException(trans('exceptions.schedule.time_in_future'));
        }

        $post->update(['status' => PostPublishStatusEnum::SCHEDULED]);

        /** @var ScheduledPost */
        return $this->scheduledPostRepository->create([
            'user_id'      => $userId,
            'post_id'      => $post->id,
            'scheduled_at' => $scheduledAt,
            'status'       => ScheduledPostStatusEnum::PENDING,
            'source'       => ScheduledPostSourceEnum::MANUAL,
        ]);
    }

    public function cancelSchedule(ScheduledPost $scheduledPost, int $userId): ScheduledPost
    {
        if ($scheduledPost->user_id !== $userId) {
            throw new ForbiddenException(trans('exceptions.schedule.forbidden_schedule'));
        }

        if ($scheduledPost->status !== ScheduledPostStatusEnum::PENDING) {
            throw new BadRequestException(trans('exceptions.schedule.not_pending'));
        }

        /** @var ScheduledPost */
        return DB::transaction(function () use ($scheduledPost) {
            $scheduledPost->post->update(['status' => PostPublishStatusEnum::DRAFT]);

            return $this->scheduledPostRepository->update($scheduledPost->id, [
                'status' => ScheduledPostStatusEnum::CANCELLED,
            ]);
        });
    }

    public function publishNow(Post $post, int $userId): Post
    {
        if ($post->user_id !== $userId) {
            throw new ForbiddenException(trans('exceptions.schedule.forbidden_post'));
        }

        if (! in_array($post->status, [
            PostPublishStatusEnum::DRAFT,
            PostPublishStatusEnum::SCHEDULED,
            PostPublishStatusEnum::FAILED,
        ], true)) {
            throw new BadRequestException(trans('exceptions.schedule.invalid_status_publish'));
        }

        DB::transaction(function () use ($post, $userId) {
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
        });

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
            throw new ForbiddenException(trans('exceptions.schedule.forbidden_schedule'));
        }

        if ($scheduledPost->status !== ScheduledPostStatusEnum::PENDING) {
            throw new BadRequestException(trans('exceptions.schedule.not_pending_reschedule'));
        }

        $scheduledAtInput = (string) $payload['scheduled_at'];

        // scheduled_at is treated as an absolute UTC timestamp.
        $scheduledAt = Carbon::parse($scheduledAtInput, 'UTC');

        if ($scheduledAt->isPast()) {
            throw new BadRequestException(trans('exceptions.schedule.time_in_future'));
        }

        /** @var ScheduledPost */
        return $this->scheduledPostRepository->update($scheduledPost->id, [
            'scheduled_at'  => $scheduledAt,
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
            perPage: (int) ($filters['per_page'] ?? 10),
            status: isset($filters['status']) && $filters['status'] !== '' ? (string) $filters['status'] : null,
            search: trim((string) ($filters['q'] ?? '')),
            hasScheduleFilter: array_key_exists('has_schedule', $filters),
            hasSchedule: (bool) ($filters['has_schedule'] ?? false),
        );
    }
}
