<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AiStudio\GetAiStudioMetricsRequest;
use App\Http\Requests\Admin\AiStudio\UpdateAiStudioSettingsRequest;
use App\Http\Resources\Api\Admin\AiStudioSettingResource;
use App\Http\Response\ApiResponse;
use App\Models\AiStudioSetting;
use App\Services\Admin\AiStudioAdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiStudioAdminController extends Controller
{
    public function __construct(
        private readonly AiStudioAdminService $service,
    ) {}

    public function metrics(GetAiStudioMetricsRequest $request): JsonResponse
    {
        return ApiResponse::success(
            data: $this->service->getMetrics($request->period()),
            message: 'AI Studio metrics retrieved.',
        );
    }

    public function settings(): JsonResponse
    {
        return ApiResponse::success(
            data: new AiStudioSettingResource(AiStudioSetting::current()),
            message: 'AI Studio settings retrieved.',
        );
    }

    public function updateSettings(UpdateAiStudioSettingsRequest $request): JsonResponse
    {
        $settings = $this->service->updateSettings(
            $request->validated(),
            (int) auth_user_id(),
        );

        return ApiResponse::success(
            data: new AiStudioSettingResource($settings),
            message: 'AI Studio settings updated.',
        );
    }

    public function requests(Request $request): JsonResponse
    {
        $filters = $request->only(['intent', 'status', 'date_from', 'date_to', 'per_page']);
        $items   = $this->service->listRequests($filters);

        return ApiResponse::success(
            data: $items,
            message: 'AI Studio requests retrieved.',
        );
    }
}
