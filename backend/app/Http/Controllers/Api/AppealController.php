<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appeal\CreateAppealRequest;
use App\Http\Requests\Appeal\GetMyAppealsRequest;
use App\Http\Response\ApiResponse;
use App\Services\AppealService;
use App\Http\Resources\Api\Appeal\AppealResource;
use Illuminate\Http\JsonResponse;

/**
 * AppealController - Handles user appeals
 */
class AppealController extends Controller
{
    /**
     * AppealController constructor.
     */
    public function __construct(
        private readonly AppealService $appealService
    ) {}

    /**
     * File a new appeal
     * @param CreateAppealRequest $request
     * @return JsonResponse
     */
    public function create(CreateAppealRequest $request): JsonResponse
    {
        $appeal = $this->appealService->create(
            $request->user(),
            $request->validated()
        );

        return ApiResponse::created(
            data: new AppealResource($appeal),
            message: 'Appeal filed successfully'
        );
    }

    /**
     * Get user's appeals
     * @param GetMyAppealsRequest $request
     * @return JsonResponse
     */
    public function index(GetMyAppealsRequest $request): JsonResponse
    {
        $appeals = $this->appealService->getUserAppeals(
            $request->user(),
            $request->validated()
        );

        return ApiResponse::success(
            data: AppealResource::collection($appeals),
            message: 'Appeals retrieved successfully',
        );
    }
}
