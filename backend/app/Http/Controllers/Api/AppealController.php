<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appeal\CreateAppealRequest;
use App\Http\Requests\Appeal\GetMyAppealsRequest;
use App\Http\Requests\Appeal\GuestRequestTokenRequest;
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
     * Request an appeal token for guest.
     * @param GuestRequestTokenRequest $request
     * @return JsonResponse
     */
    public function requestToken(GuestRequestTokenRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $appealToken = $this->appealService->requestToken($validated);

        return ApiResponse::success(
            message: 'If the resource exists and belongs to this email, a verification link has been sent.',
        );
    }

    /**
     * Verify an appeal token.
     */
    public function verifyToken(\Illuminate\Http\Request $request): JsonResponse
    {
        $request->validate(['token' => 'required|string']);

        $appealToken = $this->appealService->verifyToken($request->input('token'));

        return ApiResponse::success(
            data: [
                'email' => $appealToken->email,
                'appeal_type' => $appealToken->appeal_type,
                'resource_id' => $appealToken->resource_id,
                'resource_type' => $appealToken->resource_type,
            ],
            message: 'Token verified successfully',
        );
    }

    /**
     * Create an appeal.
     *
     * - Has `token` → submit evidence for existing appeal via token (public)
     * - No token    → create a new appeal (auth required)
     */
    public function create(CreateAppealRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $evidenceFiles = $request->file('evidence_files', []);

        if (! empty($validated['token'])) {
            $appeal = $this->appealService->createFromToken(
                token: $validated['token'],
                payload: $validated,
                evidenceFiles: $evidenceFiles,
            );

            return ApiResponse::success(
                data: new AppealResource($appeal),
                message: 'Appeal submitted successfully',
            );
        }

        $appeal = $this->appealService->create($validated, $evidenceFiles);

        return ApiResponse::created(
            data: new AppealResource($appeal),
            message: 'Appeal filed successfully',
        );
    }

    /**
     * Update an existing appeal (edit reason + evidence).
     *
     * - With `token` → public access, token proves ownership
     * - Without token → auth required, must own the appeal
     *
     * Only pending appeals can be updated.
     */
    public function update(UpdateAppealRequest $request, string $appealUuid): JsonResponse
    {
        $validated = $request->validated();
        $evidenceFiles = $request->file('evidence_files', []);
        $token = $validated['token'] ?? null;

        $appeal = $this->appealService->updateAppeal(
            uuid: $appealUuid,
            reason: $validated['reason'],
            evidenceFiles: $evidenceFiles,
            token: $token,
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
