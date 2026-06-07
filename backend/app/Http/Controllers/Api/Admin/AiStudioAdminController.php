<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AiStudio\GetAiStudioMetricsRequest;
use App\Http\Requests\Admin\AiStudio\GetAiStudioRequestsRequest;
use App\Http\Requests\Admin\AiStudio\UpdateAiStudioSettingsRequest;
use App\Http\Resources\Api\Admin\AiStudioSettingResource;
use App\Http\Resources\Api\Admin\AiUsageLogResource;
use App\Http\Response\ApiResponse;
use App\Services\Admin\AiStudioAdminService;
use Illuminate\Http\JsonResponse;

class AiStudioAdminController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  AiStudioAdminService  $service
     */
    public function __construct(
        private readonly AiStudioAdminService $service,
    ) {}

    /**
     * Retrieve AI Studio metrics for the requested period.
     *
     * @param  GetAiStudioMetricsRequest  $request
     * @return JsonResponse
     */
    public function metrics(GetAiStudioMetricsRequest $request): JsonResponse
    {
        $payload = $request->validated();

        return ApiResponse::success(
            data: $this->service->getMetrics($payload['period'] ?? null),
            message: 'AI Studio metrics retrieved.',
        );
    }

    /**
     * Retrieve the current AI Studio settings.
     *
     * @return JsonResponse
     */
    public function settings(): JsonResponse
    {
        return ApiResponse::success(
            data: new AiStudioSettingResource($this->service->getSettings()),
            message: 'AI Studio settings retrieved.',
        );
    }

    /**
     * Update the AI Studio settings.
     *
     * @param  UpdateAiStudioSettingsRequest  $request
     * @return JsonResponse
     */
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

    /**
     * Retrieve paginated AI usage requests using validated filters.
     *
     * @param  GetAiStudioRequestsRequest  $request
     * @return JsonResponse
     */
    public function requests(GetAiStudioRequestsRequest $request): JsonResponse
    {
        $items = $this->service->listRequests($request->validated());

        return ApiResponse::success(
            data: AiUsageLogResource::collection($items),
            message: 'AI Studio requests retrieved.',
        );
    }

    /**
     * Retrieve the list of available Gemini models.
     *
     * @return JsonResponse
     */
    public function availableModels(): JsonResponse
    {
        return ApiResponse::success($this->service->getAvailableModels());
    }
}
