<?php

namespace App\Http\Controllers\Api\Wellness;

use App\Http\Controllers\Controller;
use App\Http\Requests\Wellness\EndSessionRequest;
use App\Http\Requests\Wellness\GetScreenTimeHistoryRequest;
use App\Http\Requests\Wellness\GetScreenTimeStatsRequest;
use App\Http\Requests\Wellness\UpdateVideoTimeRequest;
use App\Http\Response\ApiResponse;
use App\Services\ScreenTimeTrackingService;
use Illuminate\Http\JsonResponse;

class ScreenTimeController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  ScreenTimeTrackingService  $screenTimeTrackingService
     */
    public function __construct(
        private readonly ScreenTimeTrackingService $screenTimeTrackingService,
    ) {}

    /**
     * Retrieve aggregated screen time stats for the authenticated user.
     *
     * @param  GetScreenTimeStatsRequest  $request
     * @return JsonResponse
     */
    public function stats(GetScreenTimeStatsRequest $request): JsonResponse
    {
        $payload = $request->validated();

        return ApiResponse::success(
            data:    $this->screenTimeTrackingService->getStats((int) auth_user_id(), $payload['period'] ?? null),
            message: 'Screen time stats retrieved.',
        );
    }

    /**
     * Retrieve screen time history for the authenticated user.
     *
     * @param  GetScreenTimeHistoryRequest  $request
     * @return JsonResponse
     */
    public function history(GetScreenTimeHistoryRequest $request): JsonResponse
    {
        $payload = $request->validated();

        return ApiResponse::success(
            data:    $this->screenTimeTrackingService->getHistory(
                (int) auth_user_id(),
                $payload['date_from'] ?? null,
                $payload['date_to'] ?? null,
            ),
            message: 'Screen time history retrieved.',
        );
    }

    /**
     * Start a new screen time session for the authenticated user.
     *
     * @return JsonResponse
     */
    public function startSession(): JsonResponse
    {
        $session = $this->screenTimeTrackingService->startSession((int) auth_user_id());

        return ApiResponse::success(
            data:    ['uuid' => $session->uuid, 'started_at' => $session->started_at->toIso8601String()],
            message: 'Session started.',
            code:    201,
        );
    }

    /**
     * Record a heartbeat for a screen time session.
     *
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function heartbeat(string $uuid): JsonResponse
    {
        $this->screenTimeTrackingService->heartbeatByUuid($uuid, (int) auth_user_id());

        return ApiResponse::success(data: null, message: 'Heartbeat recorded.');
    }

    /**
     * Update tracked video watch time for a session.
     *
     * @param  UpdateVideoTimeRequest  $request
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function updateVideoTime(UpdateVideoTimeRequest $request, string $uuid): JsonResponse
    {
        $updated = $this->screenTimeTrackingService->updateVideoTimeByUuid(
            $uuid,
            (int) auth_user_id(),
            $request->integer('video_seconds'),
        );

        return ApiResponse::success(
            data:    ['video_seconds' => $updated->video_seconds],
            message: 'Video time updated.',
        );
    }

    /**
     * End a screen time session.
     *
     * @param  EndSessionRequest  $request
     * @param  string  $uuid
     * @return JsonResponse
     */
    public function endSession(EndSessionRequest $request, string $uuid): JsonResponse
    {
        $this->screenTimeTrackingService->endSessionByUuid(
            $uuid,
            (int) auth_user_id(),
            (int) $request->validated('duration_seconds'),
        );

        return ApiResponse::success(data: null, message: 'Session ended.');
    }
}
