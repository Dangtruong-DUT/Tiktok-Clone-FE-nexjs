<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\FollowSomeOneRequest;
use App\Http\Requests\User\GetListUserRequest;
use App\Http\Requests\User\GetUserIndicatorsRequest;
use App\Http\Requests\User\GetUserProfileRequest;
use App\Http\Requests\User\UnFollowSomeOneRequest;
use App\Http\Response\ApiResponse;
use App\Http\Requests\User\UpdateMeRequest;
use App\Http\Resources\Api\User\UserResource;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * UserController constructor.
     */
    public function __construct(
        private readonly UserService $userService
    )
    {}

    /**
     * Search users by keyword.
     *
     * @param GetListUserRequest $request
     * @return JsonResponse
     */
    public function index(GetListUserRequest $request): JsonResponse
    {
        $users = $this->userService->search($request->validated());
        return ApiResponse::success(
            data: UserResource::collection($users),
            message: 'Users retrieved successfully'
        );
    }

    /**
     * Change the password of the authenticated user.
     *
     * @param ChangePasswordRequest $request
     * @return JsonResponse
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->userService->changePassword($request->validated());
        return ApiResponse::success(message: 'Password changed successfully');
    }

    /**
     * Follow someone
     *
     * @param FollowSomeOneRequest $request
     * @return JsonResponse
     */
    public function follow(FollowSomeOneRequest $request): JsonResponse
    {
        $this->userService->follow($request->validated());
        return ApiResponse::success(message: 'Followed successfully');
    }

    /**
     * Unfollow someone
     *
     * @param UnFollowSomeOneRequest $request
     * @return JsonResponse
     */
    public function unfollow(UnFollowSomeOneRequest $request): JsonResponse
    {
        $this->userService->unfollow($request->validated());
        return ApiResponse::success(message: 'Unfollowed successfully');
    }

    /**
     * Update the profile of the authenticated user.
     *
     * @param UpdateMeRequest $request
     * @return JsonResponse
     */
    public function update(UpdateMeRequest $request): JsonResponse
    {
        $user = $this->userService->update($request->validated());
        return ApiResponse::success(
            data: UserResource::make($user),
            message: 'User updated successfully'
        );
    }

    /**
     * Get the profile of the authenticated user.
     *
     * @return JsonResponse
     */
    public function showMe(): JsonResponse
    {
        $user = $this->userService->me();
        return ApiResponse::success(
            data: UserResource::make($user),
            message: 'User retrieved successfully'
        );
    }

    /**
     * Get indicators of the authenticated user.
     *
     * @param GetUserIndicatorsRequest $request
     * @return JsonResponse
     */
    public function indicators(GetUserIndicatorsRequest $request): JsonResponse
    {
        $indicators = $this->userService->getIndicators($request->validated());

        return ApiResponse::success(
            data: $indicators,
            message: 'User indicators retrieved successfully'
        );
    }

    /**
     * Get user profile by username.
     *
     * @param GetUserProfileRequest $request
     * @return JsonResponse
     */
    public function showProfile(GetUserProfileRequest $request): JsonResponse
    {
        $user = $this->userService->getByUsername($request->username);
        return ApiResponse::success(
            data: UserResource::make($user),
            message: 'User profile retrieved successfully'
        );
    }
}
