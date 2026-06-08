<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Appeal\ApproveAppealRequest;
use App\Http\Requests\Admin\Appeal\GetAppealsRequest;
use App\Http\Requests\Admin\Appeal\RejectAppealRequest;
use App\Http\Resources\Api\Appeal\AppealResource;
use App\Http\Response\ApiResponse;
use App\Services\Admin\AdminAppealService;
use Illuminate\Http\JsonResponse;

/**
 * Appeal admin operations controller.
 */
class AppealAdminController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  AdminAppealService  $appealService
     */
    public function __construct(
        private readonly AdminAppealService $appealService,
    ) {}

    /**
     * Get paginated list of appeals with filtering.
     * @param  GetAppealsRequest  $request
     * @return JsonResponse
     */
    public function index(GetAppealsRequest $request): JsonResponse
    {
        $appeals = $this->appealService->getAppeals($request->validated());

        return ApiResponse::success(
            data: AppealResource::collection($appeals),
            message: 'Appeals retrieved successfully'
        );
    }

    /**
     * Approve an appeal and reverse the admin action.
     * @param  ApproveAppealRequest  $request
     * @return JsonResponse
     */
    public function approve(ApproveAppealRequest $request): JsonResponse
    {
        $appeal = $this->appealService->approve($request->validated());

        return ApiResponse::success(
            data: new AppealResource($appeal),
            message: 'Appeal approved successfully'
        );
    }

    /**
     * Reject an appeal.
     * @param  RejectAppealRequest  $request
     * @return JsonResponse
     */
    public function reject(RejectAppealRequest $request): JsonResponse
    {
        $appeal = $this->appealService->reject($request->validated());

        return ApiResponse::success(
            data: new AppealResource($appeal),
            message: 'Appeal rejected successfully'
        );
    }
}
