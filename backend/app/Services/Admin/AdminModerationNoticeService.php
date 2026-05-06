<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Mail\AdminModerationActionMail;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminModerationNoticeService
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    /**
     * Send moderation notice to user with optional appeal link.
     * Admin identity is hidden from the user in both email and notification.
     *
     * @param  User  $admin  The admin performing the action
     * @param  User  $targetUser  The user receiving the notice
     * @param  AdminActionEnum  $action  The admin action taken
     * @param  string  $reason  The reason for the action
     * @param  ModelEntityTypeEnum  $entityType  The type of entity involved (e.g. user, post, comment)
     * @param  int  $entityId  The ID of the entity involved
     * @param  array  $context  Additional context for building appeal link (e.g. resource_type, resource_id)
     */
    public function send(
        User $admin,
        User $targetUser,
        AdminActionEnum $action,
        string $reason,
        ModelEntityTypeEnum $entityType,
        int $entityId,
        array $context = []
    ): void {
        $resourceType = (string) ($context['resource_type'] ?? $entityType->value);
        $resourceId = (int) ($context['resource_id'] ?? $entityId);
        $appealLink = null;

        $notificationData = [
            'action' => $action->value,
            'reason' => $reason,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
        ];

        if ($this->isAppealableAction($action)) {
            $appealType = AppealTypeEnum::fromAdminAction($action);
            if ($appealType === null) {
                throw new \InvalidArgumentException("No appeal type defined for admin action: {$action->value}");
            }

            $notificationData['appeal_type'] = $appealType->value;
            $notificationData['appeal_available'] = true;

            $appealLink = $this->buildAppealFrontendLink($appealType, $resourceType, $resourceId);
            $notificationData['appeal_link'] = $appealLink;
        }

        $this->notificationService->notifyAdminModerationAction(
            adminId: $admin->id,
            notifiableUserId: $targetUser->id,
            entityType: $entityType,
            entityId: $entityId,
            data: $notificationData,
        );

        if (empty($targetUser->email)) {
            return;
        }

        try {
            Mail::to($targetUser->email)->send(new AdminModerationActionMail(
                targetUser: $targetUser,
                action: $action,
                reason: $reason,
                appealLink: $appealLink,
            ));
        } catch (\Throwable $exception) {
            Log::warning('Failed to queue moderation email', [
                'target_user_id' => $targetUser->id,
                'action' => $action->value,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Build the frontend appeal link with query parameters.
     * User must be logged in to access this link.
     */
    private function buildAppealFrontendLink(AppealTypeEnum $appealType, string $resourceType, int $resourceId): string
    {
        $baseUrl = rtrim((string) config('app.frontend_url'), '/');

        return $baseUrl.'/en/appeal?'.http_build_query([
            'appeal_type' => $appealType->value,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
        ]);
    }

    /**
     * Determine if the admin action should allow appeals.
     */
    private function isAppealableAction(AdminActionEnum $action): bool
    {
        return in_array($action, [
            AdminActionEnum::BAN,
            AdminActionEnum::DELETE_POST,
            AdminActionEnum::DELETE_COMMENT,
        ], true);
    }
}
