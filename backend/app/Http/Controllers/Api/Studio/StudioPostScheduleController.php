<?php

namespace App\Http\Controllers\Api\Studio;

use App\Enums\Post\PostPublishStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\ReschedulePostRequest;
use App\Http\Requests\Studio\SchedulePostRequest;
use App\Http\Resources\ScheduledPostResource;
use App\Http\Response\ApiResponse;
use App\Models\Post;
use App\Services\AI\Schedule\PostScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StudioPostScheduleController extends Controller
{
    public function __construct(
        private readonly PostScheduleService $service,
    ) {}

    /** List scheduled posts (ScheduledPost records) */
    public function index(Request $request): JsonResponse
    {
        $items = $this->service->paginateForUser(
            (int) auth_user_id(),
            $request->integer('per_page', 15),
        );

        return ApiResponse::success(
            data:    ScheduledPostResource::collection($items),
            message: 'Scheduled posts retrieved.',
        );
    }

    /** List creator's own posts by status (for draft/published/failed management) */
    public function posts(Request $request): JsonResponse
    {
        $userId = (int) auth_user_id();

        $allowedStatuses = array_column(PostPublishStatusEnum::cases(), 'value');
        $status = $request->input('status');

        $query = Post::where('user_id', $userId)
            ->orderByDesc('updated_at');

        if ($status && in_array($status, $allowedStatuses, true)) {
            $query->where('status', $status);
        } else {
            // Default: all creator-visible statuses
            $query->whereIn('status', [
                PostPublishStatusEnum::DRAFT->value,
                PostPublishStatusEnum::SCHEDULED->value,
                PostPublishStatusEnum::PUBLISHED->value,
                PostPublishStatusEnum::FAILED->value,
            ]);
        }

        $posts = $query->with(['scheduledPost'])->paginate($request->integer('per_page', 20));

        return ApiResponse::success(
            data:    $this->formatPosts($posts),
            message: 'Studio posts retrieved.',
        );
    }

    public function schedule(SchedulePostRequest $request, string $postUuid): JsonResponse
    {
        $userId = (int) auth_user_id();
        $post   = Post::where('uuid', $postUuid)->where('user_id', $userId)->firstOrFail();

        $scheduledPost = $this->service->schedulePost(
            $post,
            $userId,
            $request->scheduledAt(),
            $request->timezone(),
        );

        return ApiResponse::success(
            data:    new ScheduledPostResource($scheduledPost),
            message: 'Post scheduled.',
            code:    201,
        );
    }

    public function reschedule(ReschedulePostRequest $request, string $uuid): JsonResponse
    {
        $scheduledPost = $this->service->findByUuidForUser($uuid, (int) auth_user_id());
        $updated       = $this->service->reschedule(
            $scheduledPost,
            (int) auth_user_id(),
            $request->scheduledAt(),
            $request->timezone(),
        );

        return ApiResponse::success(
            data:    new ScheduledPostResource($updated),
            message: 'Schedule updated.',
        );
    }

    public function publishNow(string $postUuid): JsonResponse
    {
        $userId = (int) auth_user_id();
        $post   = Post::where('uuid', $postUuid)->where('user_id', $userId)->firstOrFail();
        $post   = $this->service->publishNow($post, $userId);

        return ApiResponse::success(
            data:    ['uuid' => $post->uuid, 'status' => $post->status?->value],
            message: 'Post published.',
        );
    }

    public function cancel(string $uuid): JsonResponse
    {
        $scheduledPost = $this->service->findByUuidForUser($uuid, (int) auth_user_id());
        $updated       = $this->service->cancelSchedule($scheduledPost, (int) auth_user_id());

        return ApiResponse::success(
            data:    new ScheduledPostResource($updated),
            message: 'Schedule cancelled.',
        );
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private function formatPosts(\Illuminate\Pagination\LengthAwarePaginator $paginator): array
    {
        $data = $paginator->getCollection()->map(fn (Post $post) => [
            'uuid'          => $post->uuid,
            'content'       => $post->content,
            'status'        => $post->status?->value,
            'status_label'  => $post->status?->translate(),
            'published_at'  => $post->published_at?->toIso8601String(),
            'updated_at'    => $post->updated_at?->toIso8601String(),
            'created_at'    => $post->created_at->toIso8601String(),
            'scheduled_post' => $post->scheduledPost ? [
                'uuid'          => $post->scheduledPost->uuid,
                'status'        => $post->scheduledPost->status?->value,
                'scheduled_at'  => $post->scheduledPost->scheduled_at?->toIso8601String(),
                'user_timezone' => $post->scheduledPost->user_timezone,
                'error_message' => $post->scheduledPost->error_message,
            ] : null,
        ]);

        return [
            'data' => $data,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ];
    }
}
