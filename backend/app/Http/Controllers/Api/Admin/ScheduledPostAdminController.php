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
    public function __construct(
        private readonly ScheduledPostAdminService $service,
    ) {}

    public function metrics(GetAiStudioMetricsRequest $request): JsonResponse
    {
        return ApiResponse::success(
            data: $this->service->getMetrics($request->period()),
            message: 'Scheduled post metrics retrieved.',
        );
    }

    public function requests(ListScheduledPostsAdminRequest $request): JsonResponse
    {
        $items = $this->service->listRequests($request->validated());

        return ApiResponse::success(
            data: ScheduledPostAdminResource::collection($items),
            message: 'Scheduled posts retrieved.',
        );
    }

    public function forceCancel(string $uuid): JsonResponse
    {
        $scheduledPost = $this->service->findByUuid($uuid);
        $updated       = $this->service->forceCancel($scheduledPost);

        return ApiResponse::success(
            data: new ScheduledPostAdminResource($updated),
            message: 'Schedule cancelled by admin.',
        );
    }

    public function forceRetry(string $uuid): JsonResponse
    {
        $scheduledPost = $this->service->findByUuid($uuid);
        $updated       = $this->service->forceRetry($scheduledPost);

        return ApiResponse::success(
            data: new ScheduledPostAdminResource($updated),
            message: 'Schedule re-queued for retry.',
        );
    }
}
