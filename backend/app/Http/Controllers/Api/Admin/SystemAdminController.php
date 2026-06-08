<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\System\GetActivityLogsRequest;
use App\Http\Requests\Admin\System\GetDashboardStatsRequest;
use App\Http\Response\ApiResponse;
use App\Services\Admin\SystemAdminService;
use Illuminate\Http\JsonResponse;

/**
 * System admin operations controller.
 */
class SystemAdminController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  SystemAdminService  $systemAdminService
     */
    public function __construct(
        private readonly SystemAdminService $systemAdminService,
    ) {}

    /**
     * Get dashboard statistics for given period.
     *
     * @param  GetDashboardStatsRequest  $request
     * @return JsonResponse
     */
    public function getDashboardStats(GetDashboardStatsRequest $request): JsonResponse
    {
        $stats = $this->systemAdminService->getDashboardStats(
            $request->validated('period')
        );

        return ApiResponse::success(
            data: $stats,
            message: 'Dashboard statistics retrieved successfully'
        );
    }

    /**
     * Get activity logs (admin actions and system events).
     *
     * @param  GetActivityLogsRequest  $request
     * @return JsonResponse
     */
    public function getActivityLogs(GetActivityLogsRequest $request): JsonResponse
    {
        $logsResource = $this->systemAdminService->getLogsResource($request->validated());

        return ApiResponse::success(
            data: $logsResource,
            message: 'Activity logs retrieved successfully'
        );
    }
}
