<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\User\BanUserRequest;
use App\Http\Requests\Admin\User\DeleteUserRequest;
use App\Http\Requests\Admin\User\GetAdminUsersRequest;
use App\Http\Requests\Admin\User\ResetUserPasswordRequest;
use App\Http\Requests\Admin\User\RestoreUserRequest;
use App\Http\Requests\Admin\User\SendUserMailRequest;
use App\Http\Requests\Admin\User\UnbanUserRequest;
use App\Http\Resources\Api\Admin\User\AdminUserResource;
use App\Http\Response\ApiResponse;
use App\Services\Admin\UserAdminService;
use Illuminate\Http\JsonResponse;

/**
 * User admin operations controller.
 */
class UserAdminController extends Controller
{
    /**
     * UserAdminController constructor.
 */
    public function __construct(
        private readonly UserAdminService $userAdminService,
    ) {}

    /**
     * Get paginated list of users with filtering and search.
     * @param GetAdminUsersRequest $request
     * @return JsonResponse
 */
    public function getUsers(GetAdminUsersRequest $request): JsonResponse
    {
        $users = $this->userAdminService->getUsers($request->validated());

        return ApiResponse::success(
            data: AdminUserResource::collection($users),
            message: 'Users retrieved successfully'
        );
    }

    /**
     * Ban a user account.
     * @param BanUserRequest $request
     * @return JsonResponse
 */
    public function banUser(BanUserRequest $request): JsonResponse
    {
        $user = $this->userAdminService->banUser($request->validated());

        return ApiResponse::success(
            data: AdminUserResource::make($user),
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
        $user = $this->userAdminService->unbanUser($request->validated());

        return ApiResponse::success(
            data: AdminUserResource::make($user),
            message: 'User unbanned successfully'
        );
    }

    /**
     * Delete a user account.
     * Soft delete the user, data still exists in database but is marked as deleted.
      * Permanently deleted users cannot be restored, use with caution.
     * @param DeleteUserRequest $request
     * @return JsonResponse
 */
    public function deleteUser(DeleteUserRequest $request): JsonResponse
    {
        $this->userAdminService->deleteUser($request->validated());

        return ApiResponse::success(message: 'User deleted successfully');
    }

    /**
     * Restore a deleted user account.
     * Only soft-deleted users can be restored, permanently deleted users cannot be restored.
      * @param RestoreUserRequest $request
      * @return JsonResponse
 */
    public function restoreUser(RestoreUserRequest $request): JsonResponse
    {
        $user = $this->userAdminService->restoreUser($request->validated());

        return ApiResponse::success(
            data: AdminUserResource::make($user),
            message: 'User restored successfully'
        );
    }

    /**
     * Reset a user password by admin.
     * Admin provides new password directly, no email sent to user.
      * @param ResetUserPasswordRequest $request
      * @return JsonResponse
 */
    public function resetUserPassword(ResetUserPasswordRequest $request): JsonResponse
    {
        $this->userAdminService->resetUserPassword($request->validated());

        return ApiResponse::success(message: 'User password reset successfully');
    }

    /**
     * Send direct email from admin to user.
     * @param SendUserMailRequest $request
     * @return JsonResponse
 */
    public function sendUserMail(SendUserMailRequest $request): JsonResponse
    {
        $this->userAdminService->sendMailToUser($request->validated());

        return ApiResponse::success(message: 'Email sent successfully');
    }
}
