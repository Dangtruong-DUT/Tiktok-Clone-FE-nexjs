<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
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
        $period = $request->query('period', 'today');

        return response()->json([
            'success' => true,
            'data'    => $this->adminService->getCopilotMetrics((string) $period),
        ]);
    }

    public function sessions(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 20);

        return response()->json([
            'success' => true,
            'data'    => $this->adminService->getSessions($perPage),
        ]);
    }

    public function listPromptTemplates(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $this->adminService->getPromptTemplates(),
        ]);
    }

    public function updatePromptTemplate(Request $request, string $intent): JsonResponse
    {
        $data = $request->validate([
            'display_name'       => ['sometimes', 'string', 'max:150'],
            'system_prompt'      => ['sometimes', 'string'],
            'user_template'      => ['sometimes', 'string'],
            'few_shot_examples'  => ['sometimes', 'nullable', 'array'],
            'is_active'          => ['sometimes', 'boolean'],
        ]);

        $template = $this->adminService->updatePromptTemplate($intent, $data, $request->user()->id);

        return response()->json([
            'success' => true,
            'data'    => $template,
        ]);
    }

    public function updateFeatureFlags(Request $request): JsonResponse
    {
        $flags = $request->validate([
            'flags'              => ['required', 'array'],
            'flags.*'            => ['boolean'],
        ])['flags'];

        $setting = $this->adminService->updateFeatureFlags($flags, $request->user()->id);

        return response()->json([
            'success' => true,
            'data'    => ['feature_flags' => $setting->feature_flags],
        ]);
    }
}
