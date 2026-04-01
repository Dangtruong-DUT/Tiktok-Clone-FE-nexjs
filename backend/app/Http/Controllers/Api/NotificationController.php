<?php

namespace App\Http\Controllers\Api;

use App\Enums\Notification\NotificationTabEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\GetListNotificationRequest;
use App\Http\Requests\Notification\GetUnreadCountNotificationRequest;
use App\Http\Requests\Notification\MarkAllNotificationsAsReadRequest;
use App\Http\Requests\Notification\MarkNotificationAsReadRequest;
use App\Http\Resources\Api\Notification\NotificationResource;
use App\Http\Response\ApiResponse;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;

/**
 * Handle notification endpoints for authenticated users.
 */
class NotificationController extends Controller
{
    /**
     * @param NotificationService $notificationService
     */
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    /**
     * Get paginated notifications for current user.
     *
     * @param GetListNotificationRequest $request
     * @return JsonResponse
     */
    public function index(GetListNotificationRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $notifications = $this->notificationService->getNotifications($payload);

        return ApiResponse::success(
            data: NotificationResource::collection($notifications),
            message: 'Notifications retrieved successfully'
        );
    }

    /**
     * Get unread notification count for current user by tab.
     *
     * @param GetUnreadCountNotificationRequest $request
     * @return JsonResponse
     */
    public function unreadCount(GetUnreadCountNotificationRequest $request): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount(
            (string) $request->validated('tab', NotificationTabEnum::ALL->value)
        );

        return ApiResponse::success(
            data: ['unread_count' => $count],
            message: 'Unread notifications count retrieved successfully'
        );
    }

    /**
     * Mark one notification as read by UUID.
     *
     * @param MarkNotificationAsReadRequest $request
     * @return JsonResponse
     */
    public function markAsRead(MarkNotificationAsReadRequest $request): JsonResponse
    {
        $this->notificationService->markAsRead(
            (string) $request->validated('notification_uuid')
        );

        return ApiResponse::success(message: 'Notification marked as read successfully');
    }

    /**
     * Mark all notifications as read for current user by tab.
     *
     * @param MarkAllNotificationsAsReadRequest $request
     * @return JsonResponse
     */
    public function markAllAsRead(MarkAllNotificationsAsReadRequest $request): JsonResponse
    {
        $updatedCount = $this->notificationService->markAllAsRead(
            (string) $request->validated('tab', NotificationTabEnum::ALL->value));
        return ApiResponse::success(
            data: ['updated_count' => $updatedCount],
            message: 'Notifications marked as read successfully'
        );
    }
}
