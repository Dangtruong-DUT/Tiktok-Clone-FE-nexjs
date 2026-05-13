<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\ResourcePreviewResolver;
use App\Http\Requests\Appeal\CreateAppealRequest;
use App\Http\Requests\Appeal\GetMyAppealsRequest;
use App\Http\Requests\Appeal\GetResourcePreviewRequest;
use App\Http\Requests\Appeal\ShowAppealRequest;
use App\Http\Requests\Appeal\UpdateAppealRequest;
use App\Http\Resources\Api\Appeal\AppealResource;
use App\Http\Response\ApiResponse;
use App\Services\AppealService;
use Illuminate\Http\JsonResponse;

class AppealController extends Controller
{
    public function __construct(
        private readonly AppealService $appealService,
    ) {}

    /**
     * Create a new appeal (authenticated user only).
 */
    public function create(CreateAppealRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $evidenceFiles = $request->file('evidence_files', []);

        $appeal = $this->appealService->create($validated, $evidenceFiles);

        return ApiResponse::created(
            data: new AppealResource($appeal),
            message: 'Appeal filed successfully',
        );
    }

    /**
     * Update an existing appeal (edit reason + evidence).
     * Only pending appeals can be updated.
 */
    public function update(UpdateAppealRequest $request, string $appealUuid): JsonResponse
    {
        $validated = $request->validated();
        $evidenceFiles = $request->file('evidence_files', []);

        $appeal = $this->appealService->updateAppeal(
            uuid: $appealUuid,
            reason: $validated['reason'],
            evidenceFiles: $evidenceFiles,
        );

        return ApiResponse::success(
            data: new AppealResource($appeal),
            message: 'Appeal updated successfully',
        );
    }

    /**
     * Show appeal details by UUID.
     * @param ShowAppealRequest $request
     * @return JsonResponse
 */
    public function show(ShowAppealRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $uuid = $validated['appeal_uuid'];
        $appeal = $this->appealService->findByUuidForOwner($uuid);

        return ApiResponse::success(
            data: new AppealResource($appeal),
            message: 'Appeal retrieved successfully',
        );
    }

    /**
     * Return a lightweight preview for a given resource (supports soft-deleted records).
     * Used by the appeal creation form before the appeal is saved.
     */
    public function resourcePreview(GetResourcePreviewRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $preview = ResourcePreviewResolver::resolveByUuid(
            resourceType: (string) $validated['resource_type'],
            resourceUuid: $validated['resource_uuid'] ?? null,
        );

        return ApiResponse::success(
            data: $preview,
            message: 'Resource preview retrieved successfully',
        );
    }

    /**
     * Get authenticated user's appeals list.
 */
    public function index(GetMyAppealsRequest $request): JsonResponse
    {
        $appeals = $this->appealService->getAppeals(
            $request->validated()
        );

        return ApiResponse::success(
            data: AppealResource::collection($appeals),
            message: 'Appeals retrieved successfully',
        );
    }
}
