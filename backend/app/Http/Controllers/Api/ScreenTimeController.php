<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Wellness\EndSessionRequest;
use App\Http\Requests\Wellness\UpdateVideoTimeRequest;
use App\Http\Response\ApiResponse;
use App\Repositories\ScreenTimeSessionRepository;
use App\Services\ScreenTimeTrackingService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScreenTimeController extends Controller
{
    public function __construct(
        private readonly ScreenTimeTrackingService   $service,
        private readonly ScreenTimeSessionRepository $repository,
    ) {}

    public function stats(Request $request): JsonResponse
    {
        $period = in_array($request->input('period'), ['today', 'week', 'month'], true)
            ? $request->input('period')
            : 'today';

        return ApiResponse::success(
            data:    $this->service->getStats((int) auth_user_id(), $period),
            message: 'Screen time stats retrieved.',
        );
    }

    public function history(Request $request): JsonResponse
    {
        $from = $request->input('date_from')
            ? Carbon::parse($request->input('date_from'))->startOfDay()
            : now()->subDays(30)->startOfDay();

        $to = $request->input('date_to')
            ? Carbon::parse($request->input('date_to'))->endOfDay()
            : now()->endOfDay();

        return ApiResponse::success(
            data:    $this->service->getHistory((int) auth_user_id(), $from, $to),
            message: 'Screen time history retrieved.',
        );
    }

    public function startSession(): JsonResponse
    {
        $session = $this->service->startSession((int) auth_user_id());

        return ApiResponse::success(
            data:    ['uuid' => $session->uuid, 'started_at' => $session->started_at->toIso8601String()],
            message: 'Session started.',
            code:    201,
        );
    }

    public function heartbeat(string $uuid): JsonResponse
    {
        $session = $this->repository->findByUuidAndUserOrFail($uuid, (int) auth_user_id());
        $this->service->heartbeat($session);

        return ApiResponse::success(data: null, message: 'Heartbeat recorded.');
    }

    public function updateVideoTime(UpdateVideoTimeRequest $request, string $uuid): JsonResponse
    {
        $session = $this->repository->findByUuidAndUserOrFail($uuid, (int) auth_user_id());
        $updated = $this->service->updateVideoTime($session, $request->integer('video_seconds'));

        return ApiResponse::success(
            data:    ['video_seconds' => $updated->video_seconds],
            message: 'Video time updated.',
        );
    }

    public function endSession(EndSessionRequest $request, string $uuid): JsonResponse
    {
        $session = $this->repository->findByUuidAndUserOrFail($uuid, (int) auth_user_id());
        $this->service->endSession($session, $request->durationSeconds());

        return ApiResponse::success(data: null, message: 'Session ended.');
    }
}
