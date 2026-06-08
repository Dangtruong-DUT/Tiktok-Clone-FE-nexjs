<?php

namespace App\Http\Controllers\Api\Admin\Ai;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AiCopilot\GetAiCopilotMetricsRequest;
use App\Http\Requests\Admin\AiCopilot\GetAiCopilotSessionsRequest;
use App\Http\Requests\Admin\AiStudio\UpdateFeatureFlagsRequest;
use App\Http\Requests\Admin\AiStudio\UpdatePromptTemplateRequest;
use App\Http\Resources\Api\Admin\AiCopilotSessionAdminResource;
use App\Http\Resources\Api\Admin\AiPromptTemplateAdminResource;
use App\Http\Response\ApiResponse;
use App\Services\Admin\AiCopilotAdminService;
use Illuminate\Http\JsonResponse;

class AiCopilotAdminController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  AiCopilotAdminService  $adminService
     */
    public function __construct(
        private readonly AiCopilotAdminService $adminService,
    ) {}

    /**
     * Retrieve AI Copilot metrics for the requested period.
     *
     * @param  GetAiCopilotMetricsRequest  $request
     * @return JsonResponse
     */
    public function metrics(GetAiCopilotMetricsRequest $request): JsonResponse
    {
        return ApiResponse::success(
            data:    $this->adminService->getCopilotMetrics($request->validated('period')),
            message: 'AI Copilot metrics retrieved.',
        );
    }

    /**
     * Retrieve paginated AI Copilot sessions.
     *
     * @param  GetAiCopilotSessionsRequest  $request
     * @return JsonResponse
     */
    public function sessions(GetAiCopilotSessionsRequest $request): JsonResponse
    {
        return ApiResponse::success(
            data:    AiCopilotSessionAdminResource::collection($this->adminService->getSessions($request->validated())),
            message: 'AI Copilot sessions retrieved.',
        );
    }

    /**
     * Retrieve all prompt templates used by AI Copilot.
     *
     * @return JsonResponse
     */
    public function listPromptTemplates(): JsonResponse
    {
        return ApiResponse::success(
            data:    AiPromptTemplateAdminResource::collection($this->adminService->getPromptTemplates()),
            message: 'Prompt templates retrieved.',
        );
    }

    /**
     * Update a prompt template by intent.
     *
     * @param  UpdatePromptTemplateRequest  $request
     * @param  string  $intent
     * @return JsonResponse
     */
    public function updatePromptTemplate(UpdatePromptTemplateRequest $request, string $intent): JsonResponse
    {
        $template = $this->adminService->updatePromptTemplate(
            $intent,
            $request->validated(),
            (int) auth_user_id(),
        );

        return ApiResponse::success(
            data:    new AiPromptTemplateAdminResource($template),
            message: 'Prompt template updated.',
        );
    }

    /**
     * Lock a prompt template to prevent further edits.
     *
     * @param  string  $intent
     * @return JsonResponse
     */
    public function lockTemplate(string $intent): JsonResponse
    {
        $template = $this->adminService->lockTemplate($intent);

        return ApiResponse::success(
            data:    new AiPromptTemplateAdminResource($template),
            message: 'Prompt template locked.',
        );
    }

    /**
     * Unlock a prompt template.
     *
     * @param  string  $intent
     * @return JsonResponse
     */
    public function unlockTemplate(string $intent): JsonResponse
    {
        $template = $this->adminService->unlockTemplate($intent);

        return ApiResponse::success(
            data:    new AiPromptTemplateAdminResource($template),
            message: 'Prompt template unlocked.',
        );
    }

    /**
     * Update AI Copilot feature flags.
     *
     * @param  UpdateFeatureFlagsRequest  $request
     * @return JsonResponse
     */
    public function updateFeatureFlags(UpdateFeatureFlagsRequest $request): JsonResponse
    {
        $setting = $this->adminService->updateFeatureFlags(
            $request->validated()['flags'],
            (int) auth_user_id(),
        );

        return ApiResponse::success(
            data:    ['feature_flags' => $setting->feature_flags],
            message: 'Feature flags updated.',
        );
    }
}
