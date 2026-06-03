<?php

namespace App\Http\Controllers\Api\Studio;

use App\Enums\Ai\AiContentSuggestionStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Studio\AnalyzeViralScoreRequest;
use App\Http\Resources\AiViralScoreResource;
use App\Http\Response\ApiResponse;
use App\Jobs\AI\AnalyzeViralScoreJob;
use App\Models\Post;
use App\Services\AI\ViralScore\AiViralScoreService;
use Illuminate\Http\JsonResponse;

class AiViralScoreController extends Controller
{
    public function __construct(
        private readonly AiViralScoreService $service,
    ) {}

    public function analyze(AnalyzeViralScoreRequest $request): JsonResponse
    {
        $userId   = (int) auth_user_id();
        $hashtags = $request->input('hashtags', []);
        $postId   = null;

        if ($postUuid = $request->input('post_uuid')) {
            $post   = Post::where('uuid', $postUuid)->where('user_id', $userId)->firstOrFail();
            $postId = $post->id;
        }

        $score = $this->service->initiateAsync($userId, $request->input('caption', ''), $hashtags);

        if ($postId) {
            $score->update(['post_id' => $postId]);
        }

        // Only dispatch when not a cache hit — initiateAsync returns COMPLETED records from cache
        $isNew = $score->status !== AiContentSuggestionStatusEnum::COMPLETED;
        if ($isNew) {
            AnalyzeViralScoreJob::dispatch($score->id);
        }

        return ApiResponse::success(
            data:    new AiViralScoreResource($score),
            message: $isNew ? 'Viral score analysis started.' : 'Viral score retrieved from cache.',
            code:    $isNew ? 202 : 200,
        );
    }

    public function show(string $uuid): JsonResponse
    {
        $score = $this->service->findByUuidForUser($uuid, (int) auth_user_id());

        return ApiResponse::success(
            data: new AiViralScoreResource($score),
            message: 'Viral score retrieved.',
        );
    }
}
