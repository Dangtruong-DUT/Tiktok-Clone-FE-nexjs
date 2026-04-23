<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appeal\SubmitAppealEvidenceRequest;
use App\Http\Requests\Appeal\ValidateAppealTokenRequest;
use App\Http\Response\ApiResponse;
use App\Services\AppealService;
use Illuminate\Http\JsonResponse;

/**
 * Public appeal endpoints — no authentication required.
 * Users access these via token links sent in moderation emails.
 */
class AppealTokenController extends Controller
{
    /**
     * AppealTokenController constructor.
     */
    public function __construct(
        private readonly AppealService $appealService,
    ) {}

    /**
     * Verify an appeal token and return basic appeal info.
     *
     * @param ValidateAppealTokenRequest $request
     * @return JsonResponse
     */
    public function show(ValidateAppealTokenRequest $request): JsonResponse
    {
        $appeal = $this->appealService->validateToken(
            $request->validated('token')
        );

        return ApiResponse::success(
            data: [
                'uuid' => $appeal->uuid,
                'appeal_type' => $appeal->appeal_type->value,
                'resource_type' => $appeal->resource_type,
                'resource_id' => $appeal->resource_id,
                'status' => $appeal->status->value,
                'expires_at' => $appeal->appeal_token_expires_at?->toDateTimeString(),
            ],
            message: 'Appeal token verified successfully'
        );
    }

    /**
     * Submit appeal evidence and reason via token.
     *
     * @param SubmitAppealEvidenceRequest $request
     * @return JsonResponse
     */
    public function submit(SubmitAppealEvidenceRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $appeal = $this->appealService->submitEvidence(
            token: $validated['token'],
            reason: $validated['reason'],
            evidenceFiles: $request->file('evidence_files', []),
        );

        return ApiResponse::success(
            data: [
                'uuid' => $appeal->uuid,
                'status' => $appeal->status->value,
            ],
            message: 'Appeal submitted successfully'
        );
    }
}
