<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateUserSettingsRequest;
use App\Http\Resources\Api\Settings\UserSettingsResource;
use App\Http\Response\ApiResponse;
use App\Services\User\UserSettingsService;
use Illuminate\Http\JsonResponse;

class UserSettingsController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @param  UserSettingsService  $userSettingsService
     */
    public function __construct(
        private readonly UserSettingsService $userSettingsService
    ) {}

    /**
     * Get the authenticated user's settings.
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        $userSettings = $this->userSettingsService->show();

        return ApiResponse::success(
            data:    new UserSettingsResource($userSettings),
            message: 'Settings retrieved.',
        );
    }

    /**
     * Update the authenticated user's settings.
     * @param  UpdateUserSettingsRequest  $request
     * @return JsonResponse
     */
    public function update(UpdateUserSettingsRequest $request): JsonResponse
    {
        $userSettings = $this->userSettingsService->update($request->validated());

        return ApiResponse::success(
            data:    new UserSettingsResource($userSettings),
            message: 'Settings updated.',
        );
    }
}
