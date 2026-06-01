<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AiStudio\ListAiSuggestionsAdminRequest;
use App\Http\Requests\Admin\AiStudio\UpdateAiStudioSettingsRequest;
use App\Http\Resources\Api\Admin\AiStudioSettingResource;
use App\Http\Resources\Api\Admin\AiSuggestionAdminResource;
use App\Http\Response\ApiResponse;
use App\Models\AiStudioSetting;
use App\Services\Admin\AiStudioAdminService;
use App\Traits\HasAuthUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiStudioAdminController extends Controller
{
    use HasAuthUser;

    public function __construct(
        private readonly AiStudioAdminService $service,
    ) {}

    /**
     * Get aggregated AI Studio metrics for a period.
     *
     * Query param: period = today | week | month
     */
    public function metrics(Request $request): JsonResponse
    {
        $period = in_array($request->input('period'), ['today', 'week', 'month'], true)
            ? $request->input('period')
            : 'today';

        return ApiResponse::success(
            data: $this->service->getMetrics($period),
            message: 'AI Studio metrics retrieved.',
        );
    }

    /**
     * Get current AI Studio admin settings.
     */
    public function settings(): JsonResponse
    {
        return ApiResponse::success(
            data: new AiStudioSettingResource(AiStudioSetting::current()),
            message: 'AI Studio settings retrieved.',
        );
    }

    /**
     * Update AI Studio admin settings.
     */
    public function updateSettings(UpdateAiStudioSettingsRequest $request): JsonResponse
    {
        $settings = $this->service->updateSettings(
            $request->validated(),
            $this->getAuthUser()->id,
        );

        return ApiResponse::success(
            data: new AiStudioSettingResource($settings),
            message: 'AI Studio settings updated.',
        );
    }

    /**
     * List all AI suggestion requests with optional filters.
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
