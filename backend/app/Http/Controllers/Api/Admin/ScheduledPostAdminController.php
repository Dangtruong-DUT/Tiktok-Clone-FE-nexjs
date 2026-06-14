<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AiStudio\GetAiStudioMetricsRequest;
use App\Http\Requests\Admin\ScheduledPost\ListScheduledPostsAdminRequest;
use App\Http\Resources\Api\Admin\ScheduledPostAdminResource;
use App\Http\Response\ApiResponse;
use App\Services\Admin\ScheduledPostAdminService;
use Illuminate\Http\JsonResponse;

class ScheduledPostAdminController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  ScheduledPostAdminService  $service
     */
    public function __construct(
        private readonly ScheduledPostAdminService $service,
    ) {}

    /**
     * Retrieve scheduled-post metrics for the requested period.
     *
     * @param  GetAiStudioMetricsRequest  $request
     * @return JsonResponse
     */
    public function metrics(GetAiStudioMetricsRequest $request): JsonResponse
    {
        return ApiResponse::success(
            data: $this->service->getMetrics($request->validated('period')),
            message: trans('messages.admin.scheduled_metrics'),
        );
    }

    /**
     * Retrieve paginated scheduled-post records for admin review.
     *
     * @param  ListScheduledPostsAdminRequest  $request
     * @return JsonResponse
     */
    public function requests(ListScheduledPostsAdminRequest $request): JsonResponse
    {
        $items = $this->service->listRequests($request->validated());

        return ApiResponse::success(
            data: ScheduledPostAdminResource::collection($items),
            message: trans('messages.admin.scheduled_retrieved'),
        );
    }

    /**
     * Cancel a scheduled post as an administrator.
     *
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function forceCancel(string $uuid): JsonResponse
    {
        $scheduledPost = $this->service->findByUuid($uuid);
        $updated       = $this->service->forceCancel($scheduledPost);

        return ApiResponse::success(
            data: new ScheduledPostAdminResource($updated),
            message: trans('messages.admin.schedule_cancelled'),
        );
    }

    /**
     * Re-queue a failed scheduled post as an administrator.
     *
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function forceRetry(string $uuid): JsonResponse
    {
        $scheduledPost = $this->service->findByUuid($uuid);
        $updated       = $this->service->forceRetry($scheduledPost);

        return ApiResponse::success(
            data: new ScheduledPostAdminResource($updated),
            message: trans('messages.admin.schedule_requeued'),
        );
    }
}
