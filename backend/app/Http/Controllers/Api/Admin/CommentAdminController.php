<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Comment\DeleteCommentRequest;
use App\Http\Requests\Admin\Comment\GetAdminCommentsRequest;
use App\Http\Resources\Api\Admin\Comment\AdminCommentResource;
use App\Http\Response\ApiResponse;
use App\Services\Admin\CommentAdminService;
use Illuminate\Http\JsonResponse;

/**
 * Comment admin operations controller.
 */
class CommentAdminController extends Controller
{
    /**
     * CommentAdminController constructor.
 */
    public function __construct(
        private readonly CommentAdminService $commentAdminService,
    ) {}

    /**
     * Get paginated list of comments with filtering.
     * @param GetAdminCommentsRequest $request
     * @return JsonResponse
 */
    public function getComments(GetAdminCommentsRequest $request): JsonResponse
    {
        $comments = $this->commentAdminService->getComments($request->validated());

        return ApiResponse::success(
            data: AdminCommentResource::collection($comments),
            message: 'Comments retrieved successfully'
        );
    }

    /**
     * Delete a comment permanently.
     * @param DeleteCommentRequest $request
     * @return JsonResponse
 */
    public function deleteComment(DeleteCommentRequest $request): JsonResponse
    {
        $this->commentAdminService->deleteComment($request->validated());

        return ApiResponse::success(message: 'Comment deleted successfully');
    }
}
