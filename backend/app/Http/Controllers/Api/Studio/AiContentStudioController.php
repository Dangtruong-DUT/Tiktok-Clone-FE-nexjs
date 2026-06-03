<?php

namespace App\Http\Controllers\Api\Studio;

use App\DTOs\AI\AiContentStudioInputData;
use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\GenerateAiContentSuggestionRequest;
use App\Http\Requests\Studio\ListAiContentSuggestionRequest;
use App\Http\Resources\AiContentSuggestionResource;
use App\Http\Response\ApiResponse;
use App\Services\AI\ContentStudio\AiContentStudioService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class AiContentStudioController extends Controller
{
    /**
     * Create the controller instance.
     *
     * @param  AiContentStudioService  $service
     */
    public function __construct(
        private readonly AiContentStudioService $service,
    ) {}

    /**
     * Start async generation for an AI content suggestion.
     *
     * @param  GenerateAiContentSuggestionRequest  $request
     * @return JsonResponse
     */
    public function generate(GenerateAiContentSuggestionRequest $request): JsonResponse
    {
        $suggestion = $this->service->initiateAsync(
            (int) auth_user_id(),
            AiContentStudioInputData::fromRequest($request),
        );

        return ApiResponse::success(
            data: new AiContentSuggestionResource($suggestion),
            message: 'AI content suggestion is being generated.',
            code: Response::HTTP_ACCEPTED,
        );
    }

    /**
     * List AI content suggestions for the authenticated user.
      *
      * @param  ListAiContentSuggestionRequest  $request
      * @return JsonResponse
     */
    public function index(ListAiContentSuggestionRequest $request): JsonResponse
    {
        $items = $this->service->listByUser(
            (int) auth_user_id(),
            $request->integer('per_page', 15),
        );

        return ApiResponse::success(
            data: AiContentSuggestionResource::collection($items),
            message: 'AI content suggestions retrieved.',
        );
    }

    /**
     * Get a single AI content suggestion by UUID.
      *
      * @param  string  $uuid
      * @return JsonResponse
     */
    public function show(string $uuid): JsonResponse
    {
        $suggestion = $this->service->findByUuidForUser($uuid, (int) auth_user_id());

        return ApiResponse::success(
            data: new AiContentSuggestionResource($suggestion),
            message: 'AI content suggestion retrieved.',
        );
    }

    /**
     * Mark a suggestion as applied.
      *
      * @param  string  $uuid
      * @return JsonResponse
     */
    public function apply(string $uuid): JsonResponse
    {
        $suggestion = $this->service->findByUuidForUser($uuid, (int) auth_user_id());
        $updated    = $this->service->applySuggestion($suggestion);

        return ApiResponse::success(
            data: new AiContentSuggestionResource($updated),
            message: 'AI suggestion marked as applied.',
        );
    }
}
