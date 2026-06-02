<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AiStudio\GetAiStudioMetricsRequest;
use App\Http\Requests\Admin\AiStudio\ListAiSuggestionsAdminRequest;
use App\Http\Requests\Admin\AiStudio\UpdateAiStudioSettingsRequest;
use App\Http\Resources\Api\Admin\AiStudioSettingResource;
use App\Http\Resources\Api\Admin\AiSuggestionAdminResource;
use App\Http\Response\ApiResponse;
use App\Models\AiStudioSetting;
use App\Services\Admin\AiStudioAdminService;
use Illuminate\Http\JsonResponse;

class AiStudioAdminController extends Controller
{
    /**
     * Create the controller instance.
     *
     * @param  AiStudioAdminService  $service
     */
    public function __construct(
        private readonly AiStudioAdminService $service,
    ) {}

    /**
     * Get AI Studio metrics for the requested period.
     *
     * @param  GetAiStudioMetricsRequest  $request
     * @return JsonResponse
     */
    public function metrics(GetAiStudioMetricsRequest $request): JsonResponse
    {
        return ApiResponse::success(
            data: $this->service->getMetrics($request->period()),
            message: 'AI Studio metrics retrieved.',
        );
    }

    /**
     * Get current AI Studio settings.
      *
      * @return JsonResponse
     */
    public function settings(): JsonResponse
    {
        return ApiResponse::success(
            data: new AiStudioSettingResource(AiStudioSetting::current()),
            message: 'AI Studio settings retrieved.',
        );
    }

    /**
     * Update AI Studio settings.
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
     * List AI Studio content requests for admin.
      *
      * @param  ListAiSuggestionsAdminRequest  $request
      * @return JsonResponse
     */
    public function requests(ListAiSuggestionsAdminRequest $request): JsonResponse
    {
        $items = $this->service->listRequests($request->validated());

        return ApiResponse::success(
            data: AiSuggestionAdminResource::collection($items),
            message: 'AI Studio requests retrieved.',
        );
    }
}
