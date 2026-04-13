<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Comment\DeleteCommentRequest;
use App\Http\Requests\Admin\Comment\GetAdminCommentsRequest;
use App\Http\Requests\Admin\Appeal\GetAppealsRequest;
use App\Http\Requests\Admin\Appeal\ApproveAppealRequest;
use App\Http\Requests\Admin\Appeal\RejectAppealRequest;
use App\Http\Requests\Admin\Post\DeletePostRequest;
use App\Http\Requests\Admin\Post\GetAdminPostsRequest;
use App\Http\Requests\Admin\Post\HidePostRequest;
use App\Http\Requests\Admin\Post\UnhidePostRequest;
use App\Http\Requests\Admin\System\GetActivityLogsRequest;
use App\Http\Requests\Admin\System\GetDashboardStatsRequest;
use App\Http\Requests\Admin\User\BanUserRequest;
use App\Http\Requests\Admin\User\DeleteUserRequest;
use App\Http\Requests\Admin\User\GetAdminUsersRequest;
use App\Http\Requests\Admin\User\UnbanUserRequest;
use App\Http\Response\ApiResponse;
use App\Services\Admin\CommentAdminService;
use App\Services\Admin\PostAdminService;
use App\Services\Admin\SystemAdminService;
use App\Services\Admin\UserAdminService;
use App\Services\AppealService;
use App\Http\Resources\Api\Appeal\AppealResource;
use Illuminate\Http\JsonResponse;

/**
 * AdminController - Main entry point for all admin operations
 * Handles: user management, content moderation, system monitoring, appeal management
 *
 * All endpoints require admin authorization (SUPER_ADMIN role)
 */
class AdminController extends Controller
{
    /**
     * AdminController constructor.
     */
    public function __construct(
        private readonly UserAdminService $userAdminService,
        private readonly PostAdminService $postAdminService,
        private readonly CommentAdminService $commentAdminService,
        private readonly SystemAdminService $systemAdminService,
        private readonly AppealService $appealService,
    ) {}

    // ============ USER MANAGEMENT ============

    /**
     * Get paginated list of users with filtering and search.
     * @param GetAdminUsersRequest $request
     * @return JsonResponse
     */
    public function getUsers(GetAdminUsersRequest $request): JsonResponse
    {
        $users = $this->userAdminService->getFilteredUsers($request->validated());

        return ApiResponse::success(
            data: $users->items(),
            message: 'Users retrieved successfully',
            meta: [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
                'per_page' => $users->perPage(),
            ]
        );
    }

    /**
     * Ban a user account.
     * @param BanUserRequest $request
     * @return JsonResponse
     */
    public function banUser(BanUserRequest $request): JsonResponse
    {
        $user = $this->userAdminService->banUser(
            $request->user(),
            $request->input('user_id'),
            $request->validated()
        );

        return ApiResponse::success(
            data: $user,
            message: 'User banned successfully'
        );
    }

    /**
     * Unban a user account.
     * @param UnbanUserRequest $request
     * @return JsonResponse
     */
    public function unbanUser(UnbanUserRequest $request): JsonResponse
    {
        $user = $this->userAdminService->unbanUser(
            $request->user(),
            $request->input('user_id')
        );

        return ApiResponse::success(
            data: $user,
            message: 'User unbanned successfully'
        );
    }

    /**
     * Delete a user account.
     * @param DeleteUserRequest $request
     * @return JsonResponse
     */
    public function deleteUser(DeleteUserRequest $request): JsonResponse
    {
        $this->userAdminService->deleteUser(
            $request->user(),
            $request->input('user_id'),
            $request->validated()
        );

        return ApiResponse::success(message: 'User deleted successfully');
    }

    // ============ POST MODERATION ============

    /**
     * Get paginated list of posts with filtering.
     * @param GetAdminPostsRequest $request
     * @return JsonResponse
     */
    public function getPosts(GetAdminPostsRequest $request): JsonResponse
    {
        $posts = $this->postAdminService->getFilteredPosts($request->validated());

        return ApiResponse::success(
            data: $posts->items(),
            message: 'Posts retrieved successfully',
            meta: [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
                'per_page' => $posts->perPage(),
            ]
        );
    }

    /**
     * Hide a post from public view.
     * @param HidePostRequest $request
     * @return JsonResponse
     */
    public function hidePost(HidePostRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $post = $this->postAdminService->hidePost(
            $request->user(),
            $validated['post_uuid'],
            $validated
        );

        return ApiResponse::success(
            data: $post,
            message: 'Post hidden successfully'
        );
    }

    /**
     * Unhide a post.
     * @param UnhidePostRequest $request
     * @return JsonResponse
     */
    public function unhidePost(UnhidePostRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $post = $this->postAdminService->unhidePost(
            $request->user(),
            $validated['post_uuid']
        );

        return ApiResponse::success(
            data: $post,
            message: 'Post unhidden successfully'
        );
    }

    /**
     * Delete a post permanently.
     * @param DeletePostRequest $request
     * @return JsonResponse
     */
    public function deletePost(DeletePostRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $this->postAdminService->deletePost(
            $request->user(),
            $validated['post_uuid'],
            $validated
        );

        return ApiResponse::success(message: 'Post deleted successfully');
    }

    // ============ COMMENT MODERATION ============

    /**
     * Get paginated list of comments with filtering.
     * @param GetAdminCommentsRequest $request
     * @return JsonResponse
     */
    public function getComments(GetAdminCommentsRequest $request): JsonResponse
    {
        $comments = $this->commentAdminService->getFilteredComments($request->validated());

        return ApiResponse::success(
            data: $comments->items(),
            message: 'Comments retrieved successfully',
            meta: [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'total' => $comments->total(),
                'per_page' => $comments->perPage(),
            ]
        );
    }

    /**
     * Delete a comment permanently.
     * @param DeleteCommentRequest $request
     * @return JsonResponse
     */
    public function deleteComment(DeleteCommentRequest $request): JsonResponse
    {
        $this->commentAdminService->deleteComment(
            $request->user(),
            $request->input('comment_id'),
            $request->validated()
        );

        return ApiResponse::success(message: 'Comment deleted successfully');
    }

    // ============ SYSTEM MONITORING ============

    /**
     * Get dashboard statistics for given period.
     * @param GetDashboardStatsRequest $request
     * @return JsonResponse
     */
    public function getDashboardStats(GetDashboardStatsRequest $request): JsonResponse
    {
        $stats = $this->systemAdminService->getDashboardStats(
            $request->input('period', 'today')
        );

        return ApiResponse::success(
            data: $stats,
            message: 'Dashboard statistics retrieved successfully'
        );
    }

    /**
     * Get activity logs (admin actions and system events).
     * @param GetActivityLogsRequest $request
     * @return JsonResponse
     */
    public function getActivityLogs(GetActivityLogsRequest $request): JsonResponse
    {
        $logType = $request->input('log_type', 'admin');
        $logs = $logType === 'activity'
            ? $this->systemAdminService->getActivityLogs($request->validated())
            : $this->systemAdminService->getAdminLogs($request->validated());

        return ApiResponse::success(
            data: $logs->items(),
            message: 'Activity logs retrieved successfully',
        );
    }

    // ============ APPEAL MANAGEMENT ============

    /**
     * Get paginated list of appeals with filtering.
     * @param GetAppealsRequest $request
     * @return JsonResponse
     */
    public function getAppeals(GetAppealsRequest $request): JsonResponse
    {
        $appeals = $this->appealService->getAllAppeals($request->validated());

        return ApiResponse::success(
            data: AppealResource::collection($appeals),
            message: 'Appeals retrieved successfully',
            meta: [
                'current_page' => $appeals->currentPage(),
                'last_page' => $appeals->lastPage(),
                'total' => $appeals->total(),
                'per_page' => $appeals->perPage(),
            ]
        );
    }

    /**
     * Approve an appeal and reverse the admin action.
     * @param ApproveAppealRequest $request
     * @return JsonResponse
     */
    public function approveAppeal(ApproveAppealRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $appeal = $this->appealService->approve(
            $request->user(),
            $validated['appeal_id'],
            $validated
        );

        return ApiResponse::success(
            data: new AppealResource($appeal),
            message: 'Appeal approved successfully'
        );
    }

    /**
     * Reject an appeal.
     * @param RejectAppealRequest $request
     * @return JsonResponse
     */
    public function rejectAppeal(RejectAppealRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $appeal = $this->appealService->reject(
            $request->user(),
            $validated['appeal_id'],
            $validated
        );

        return ApiResponse::success(
            data: new AppealResource($appeal),
            message: 'Appeal rejected successfully'
        );
    }
}

