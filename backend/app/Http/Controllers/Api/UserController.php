<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\FollowSomeOneRequest;
use App\Http\Requests\User\UnFollowSomeOneRequest;
use App\Http\Response\ApiResponse;
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
     * Change the password of the authenticated user.
     *
     * @param ChangePasswordRequest $request
     * @return JsonResponse
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->userService->changePassword($request->validated());
        return ApiResponse::success(null, 'Password changed successfully');
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
        return ApiResponse::success(null, 'Followed successfully');
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
        return ApiResponse::success(null, 'Unfollowed successfully');
    }

}
