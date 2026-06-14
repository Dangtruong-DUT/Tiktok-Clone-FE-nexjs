<?php

namespace App\Http\Controllers\Api\Post;

use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\ListScheduledPostsRequest;
use App\Http\Requests\Studio\ListStudioPostsRequest;
use App\Http\Requests\Studio\ReschedulePostRequest;
use App\Http\Requests\Studio\SchedulePostRequest;
use App\Http\Resources\Api\Studio\ScheduledPostResource;
use App\Http\Resources\Api\Studio\StudioPostResource;
use App\Http\Response\ApiResponse;
use App\Services\Post\PostScheduleService;
use Illuminate\Http\JsonResponse;

class PostScheduleController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  PostScheduleService  $postScheduleService
     */
    public function __construct(
        private readonly PostScheduleService $postScheduleService,
    ) {}

    /**
     * List scheduled post records for the authenticated user.
     *
     * @param  ListScheduledPostsRequest  $request
     * @return JsonResponse
     */
    public function index(ListScheduledPostsRequest $request): JsonResponse
    {
        $items = $this->postScheduleService->paginateForUser(
            (int) auth_user_id(),
            $request->validated(),
        );

        return ApiResponse::success(
            data:    ScheduledPostResource::collection($items),
            message: trans('messages.schedule.retrieved'),
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
        $paginator = $this->postScheduleService->paginateStudioPostsForUser(
            userId: (int) auth_user_id(),
            filters: $request->validated(),
        );

        return ApiResponse::success(
            data:    StudioPostResource::collection($paginator->getCollection()),
            message: trans('messages.studio.posts_retrieved'),
            meta:    [
                'type'         => 'offset',
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
        $scheduledPost = $this->postScheduleService->schedulePostByUuid(
            $postUuid,
            (int) auth_user_id(),
            $request->validated(),
        );

        return ApiResponse::created(
            data:    new ScheduledPostResource($scheduledPost),
            message: trans('messages.post.scheduled'),
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
        $scheduledPost = $this->postScheduleService->findByUuidForUser($uuid, (int) auth_user_id());
        $updated       = $this->postScheduleService->reschedule(
            $scheduledPost,
            (int) auth_user_id(),
            $request->validated(),
        );

        return ApiResponse::success(
            data:    new ScheduledPostResource($updated),
            message: trans('messages.schedule.updated'),
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
        $post = $this->postScheduleService->publishNowByUuid($postUuid, (int) auth_user_id());

        return ApiResponse::success(
            data:    ['uuid' => $post->uuid, 'status' => $post->status?->value],
            message: trans('messages.post.published'),
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
        $scheduledPost = $this->postScheduleService->findByUuidForUser($uuid, (int) auth_user_id());
        $updated       = $this->postScheduleService->cancelSchedule($scheduledPost, (int) auth_user_id());

        return ApiResponse::success(
            data:    new ScheduledPostResource($updated),
            message: trans('messages.schedule.cancelled'),
        );
    }

}
