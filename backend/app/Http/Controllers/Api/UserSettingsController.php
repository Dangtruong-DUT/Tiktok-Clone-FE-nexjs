<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateUserSettingsRequest;
use App\Http\Resources\Api\Settings\UserSettingsResource;
use App\Http\Response\ApiResponse;
use App\Services\UserSettingsService;
use Illuminate\Http\JsonResponse;

class UserSettingsController extends Controller
{
    /**
     * UserSettingsController constructor.
     */
    public function __construct(
        private readonly UserSettingsService $userSettingsService
    ) {}

    public function show(): JsonResponse
    {
        $userSettings = $this->userSettingsService->show();

        return ApiResponse::success(new UserSettingsResource($userSettings));
    }

    public function update(UpdateUserSettingsRequest $request): JsonResponse
    {
        $userSettings = $this->userSettingsService->update($request->validated());

        return ApiResponse::success(new UserSettingsResource($userSettings));
    }
}
