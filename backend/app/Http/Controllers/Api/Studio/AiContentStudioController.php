<?php

namespace App\Http\Controllers\Api\Studio;

use App\DTOs\AI\AiContentStudioInputData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\GenerateAiContentSuggestionRequest;
use App\Http\Requests\Studio\ListAiContentSuggestionRequest;
use App\Http\Resources\AiContentSuggestionResource;
use App\Http\Response\ApiResponse;
use App\Models\AiContentSuggestion;
use App\Services\AI\ContentStudio\AiContentStudioService;
use App\Traits\HasAuthUser;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class AiContentStudioController extends Controller
{
    use HasAuthUser;

    public function __construct(
        private readonly AiContentStudioService $service,
    ) {}

    /**
     * Generate AI content suggestions asynchronously via queue job.
     *
     * Returns 202 immediately with pending suggestion record.
     * Frontend should poll GET /{uuid} until status = completed.
     */
    public function generate(GenerateAiContentSuggestionRequest $request): JsonResponse
    {
        $input      = AiContentStudioInputData::fromRequest($request);
        $user       = $this->getAuthUser();
        $suggestion = $this->service->initiateAsync($user->id, $input);

        return ApiResponse::success(
            data: new AiContentSuggestionResource($suggestion),
            message: 'AI content suggestion is being generated.',
            code: Response::HTTP_ACCEPTED,
        );
    }

    /**
     * List current user's AI content suggestions (latest first).
     */
    public function index(ListAiContentSuggestionRequest $request): JsonResponse
    {
        $user  = $this->getAuthUser();
        $items = AiContentSuggestion::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate($request->input('per_page', 15));

        return ApiResponse::success(
            data: AiContentSuggestionResource::collection($items),
            message: 'AI content suggestions retrieved.',
        );
    }

    /**
     * Show a single suggestion by UUID.
     *
     * Frontend polls this endpoint every ~2s until status = completed or failed.
     */
    public function show(string $uuid): JsonResponse
    {
        $user       = $this->getAuthUser();
        $suggestion = AiContentSuggestion::where('uuid', $uuid)
            ->where('user_id', $user->id)
            ->firstOrFail();

        return ApiResponse::success(
            data: new AiContentSuggestionResource($suggestion),
            message: 'AI content suggestion retrieved.',
        );
    }

    /**
     * Mark a suggestion as applied to a post.
     */
    public function apply(string $uuid): JsonResponse
    {
        $user       = $this->getAuthUser();
        $suggestion = AiContentSuggestion::where('uuid', $uuid)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $updated = $this->service->applySuggestion($suggestion);

        return ApiResponse::success(
            data: new AiContentSuggestionResource($updated),
            message: 'AI suggestion marked as applied.',
        );
    }
}
