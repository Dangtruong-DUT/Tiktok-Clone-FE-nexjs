<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hashtag\GetListHashtagRequest;
use App\Http\Resources\Api\Hashtag\HashtagResource;
use App\Http\Response\ApiResponse;
use App\Services\HashtagService;
use Illuminate\Http\JsonResponse;

class HashtagController extends Controller
{
    public function __construct(
        private readonly HashtagService $hashtagService
    ) {}

    /**
     * Search for hashtags.
     *
     * @param  GetListHashtagRequest  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(GetListHashtagRequest $request): JsonResponse
    {
        $hashtags = $this->hashtagService->search($request->validated());

        return ApiResponse::success(
            data: HashtagResource::collection($hashtags),
            message: 'Hashtags retrieved successfully',
        );
    }
}
