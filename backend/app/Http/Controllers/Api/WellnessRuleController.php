<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Wellness\ParseNLRuleRequest;
use App\Http\Requests\Wellness\SaveWellnessRuleRequest;
use App\Http\Resources\Api\Wellness\WellnessRuleResource;
use App\Http\Response\ApiResponse;
use App\Services\WellnessRuleService;
use Illuminate\Http\JsonResponse;

class WellnessRuleController extends Controller
{
    public function __construct(
        private readonly WellnessRuleService $service,
    ) {}

    /** List all wellness rules for the authenticated user. */
    public function index(): JsonResponse
    {
        $rules = $this->service->listForUser((int) auth_user_id());

        return ApiResponse::success(
            data:    WellnessRuleResource::collection($rules)->resolve(),
            message: 'Wellness rules retrieved.',
        );
    }

    /** Create a new wellness rule. */
    public function store(SaveWellnessRuleRequest $request): JsonResponse
    {
        $rule = $this->service->create((int) auth_user_id(), $request->validated());

        return ApiResponse::success(
            data:    new WellnessRuleResource($rule),
            message: 'Wellness rule created.',
            code:    201,
        );
    }

    /** Update an existing wellness rule by UUID. */
    public function update(SaveWellnessRuleRequest $request, string $uuid): JsonResponse
    {
        $rule    = $this->service->findByUuidForUser($uuid, (int) auth_user_id());
        $updated = $this->service->update($rule, $request->validated());

        return ApiResponse::success(
            data:    new WellnessRuleResource($updated),
            message: 'Wellness rule updated.',
        );
    }

    /** Delete a wellness rule by UUID. */
    public function destroy(string $uuid): JsonResponse
    {
        $rule = $this->service->findByUuidForUser($uuid, (int) auth_user_id());
        $this->service->delete($rule);

        return ApiResponse::success(data: null, message: 'Wellness rule deleted.');
    }

    /** Parse a natural-language rule description into a structured preview (does not save). */
    public function parseNaturalLanguage(ParseNLRuleRequest $request): JsonResponse
    {
        $preview = $this->service->parseNaturalLanguage($request->text());

        return ApiResponse::success(
            data:    $preview,
            message: 'Rule parsed successfully.',
        );
    }

    /** Analyze the authenticated user's screen-time and return AI-generated wellness insights. */
    public function analyze(): JsonResponse
    {
        $result = $this->service->analyzeUsage((int) auth_user_id());

        return ApiResponse::success(
            data:    $result,
            message: 'Usage analysis complete.',
        );
    }
}
