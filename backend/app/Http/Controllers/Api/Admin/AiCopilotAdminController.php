<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AiStudio\UpdateFeatureFlagsRequest;
use App\Http\Requests\Admin\AiStudio\UpdatePromptTemplateRequest;
use App\Http\Response\ApiResponse;
use App\Services\Admin\AiCopilotAdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiCopilotAdminController extends Controller
{
    public function __construct(
        private readonly AiCopilotAdminService $adminService,
    ) {}

    public function metrics(Request $request): JsonResponse
    {
        $period = (string) $request->query('period', 'today');

        return ApiResponse::success($this->adminService->getCopilotMetrics($period));
    }

    public function sessions(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 20);

        return ApiResponse::success($this->adminService->getSessions($perPage));
    }

    public function listPromptTemplates(): JsonResponse
    {
        return ApiResponse::success($this->adminService->getPromptTemplates());
    }

    public function updatePromptTemplate(UpdatePromptTemplateRequest $request, string $intent): JsonResponse
    {
        $template = $this->adminService->updatePromptTemplate(
            $intent,
            $request->validated(),
            $request->user()->id,
        );

        return ApiResponse::success($template);
    }

    public function lockTemplate(string $intent): JsonResponse
    {
        $template = \App\Models\AiPromptTemplate::where('intent', $intent)->firstOrFail();
        $template->update(['is_locked' => true]);

        return ApiResponse::success($template);
    }

    public function unlockTemplate(string $intent): JsonResponse
    {
        $template = \App\Models\AiPromptTemplate::where('intent', $intent)->firstOrFail();
        $template->update(['is_locked' => false]);

        return ApiResponse::success($template);
    }

    public function updateFeatureFlags(UpdateFeatureFlagsRequest $request): JsonResponse
    {
        $setting = $this->adminService->updateFeatureFlags(
            $request->validated()['flags'],
            $request->user()->id,
        );

        return ApiResponse::success(['feature_flags' => $setting->feature_flags]);
    }
}
