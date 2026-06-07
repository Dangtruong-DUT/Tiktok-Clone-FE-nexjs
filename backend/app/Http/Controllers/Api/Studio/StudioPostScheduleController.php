<?php

namespace App\Http\Controllers\Api\Studio;

use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\ListScheduledPostsRequest;
use App\Http\Requests\Studio\ListStudioPostsRequest;
use App\Http\Requests\Studio\ReschedulePostRequest;
use App\Http\Requests\Studio\SchedulePostRequest;
use App\Http\Resources\Api\Studio\ScheduledPostResource;
use App\Http\Resources\Api\Studio\StudioPostResource;
use App\Http\Response\ApiResponse;
use App\Services\AI\Schedule\PostScheduleService;
use Illuminate\Http\JsonResponse;

class StudioPostScheduleController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  PostScheduleService  $service
     */
    public function __construct(
        private readonly PostScheduleService $service,
    ) {}

    /**
     * List scheduled post records for the authenticated user.
     *
     * @param  ListScheduledPostsRequest  $request
     * @return JsonResponse
     */
    public function index(ListScheduledPostsRequest $request): JsonResponse
    {
        $items = $this->service->paginateForUser(
            (int) auth_user_id(),
            $request->validated(),
        );

        return ApiResponse::success(
            data:    ScheduledPostResource::collection($items),
            message: 'Scheduled posts retrieved.',
        );
    }

    /**
     * List the authenticated creator's posts with optional Studio filters.
     *
     * @param  ListStudioPostsRequest  $request
     * @return JsonResponse
     */
    public function posts(ListStudioPostsRequest $request): JsonResponse
    {
        $paginator = $this->service->paginateStudioPostsForUser(
            userId: (int) auth_user_id(),
            filters: $request->validated(),
        );

        return ApiResponse::success(
            data:    StudioPostResource::collection($paginator->getCollection()),
            message: 'Studio posts retrieved.',
            meta:    [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        );
    }

    /**
     * Schedule a post for future publication.
     *
     * @param  SchedulePostRequest  $request
     * @param  string  $postUuid
     * @return JsonResponse
     */
    public function schedule(SchedulePostRequest $request, string $postUuid): JsonResponse
    {
        $scheduledPost = $this->service->schedulePostByUuid(
            $postUuid,
            (int) auth_user_id(),
            $request->validated(),
        );

        return ApiResponse::success(
            data:    new ScheduledPostResource($scheduledPost),
            message: 'Post scheduled.',
            code:    201,
        );
    }

    /**
     * Reschedule an existing scheduled post.
     *
     * @param  ReschedulePostRequest  $request
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function reschedule(ReschedulePostRequest $request, string $uuid): JsonResponse
    {
        $scheduledPost = $this->service->findByUuidForUser($uuid, (int) auth_user_id());
        $updated       = $this->service->reschedule(
            $scheduledPost,
            (int) auth_user_id(),
            $request->validated(),
        );

        return ApiResponse::success(
            data:    new ScheduledPostResource($updated),
            message: 'Schedule updated.',
        );
    }

    /**
     * Publish a post immediately.
     *
     * @param  string  $postUuid
     * @return JsonResponse
     */
    public function publishNow(string $postUuid): JsonResponse
    {
        $post = $this->service->publishNowByUuid($postUuid, (int) auth_user_id());

        return ApiResponse::success(
            data:    ['uuid' => $post->uuid, 'status' => $post->status?->value],
            message: 'Post published.',
        );
    }

    /**
     * Cancel a scheduled post.
     *
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function cancel(string $uuid): JsonResponse
    {
        $scheduledPost = $this->service->findByUuidForUser($uuid, (int) auth_user_id());
        $updated       = $this->service->cancelSchedule($scheduledPost, (int) auth_user_id());

        return ApiResponse::success(
            data:    new ScheduledPostResource($updated),
            message: 'Schedule cancelled.',
        );
    }

}
