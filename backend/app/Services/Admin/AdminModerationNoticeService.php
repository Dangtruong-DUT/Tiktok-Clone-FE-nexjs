<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Mail\AdminModerationActionMail;
use App\Models\User;
use App\Services\AppealService;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AdminModerationNoticeService
{
    public function __construct(
        private readonly NotificationService $notificationService,
        private readonly AppealService $appealService,
    ) {}

    /**
     * Send moderation notice to user with optional appeal link.
     * Admin identity is hidden from the user in both email and notification.
     *
     * @param User $admin The admin performing the action
     * @param User $targetUser The user receiving the notice
     * @param AdminActionEnum $action The admin action taken
     * @param string $reason The reason for the action
     * @param ModelEntityTypeEnum $entityType The type of entity involved (e.g. user, post, comment)
     * @param int $entityId The ID of the entity involved
     * @param array $context Additional context for building appeal link (e.g. resource_type, resource_id)
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
        $appealType = AppealTypeEnum::fromAdminAction($action);
        if ($appealType === null) {
            throw new \InvalidArgumentException("No appeal type defined for admin action: {$action->value}");
        }
        $resourceType = (string) ($context['resource_type'] ?? $entityType->value);
        $resourceId = (int) ($context['resource_id'] ?? $entityId);

        // Create appeal record with token for email-based access
        $appeal = $this->appealService->create([
            'user_id' => $targetUser->id,
            'appeal_type' => $appealType->value,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'reason' => $reason,
        ]);

        $appealLink = $this->buildAppealFrontendLink($appeal->appeal_token);

        $notificationData = [
            'action' => $action->value,
            'action_label' => $action->label(),
            'reason' => $reason,
            'appeal_type' => $appealType->value,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'appeal_link' => $appealLink,
        ];

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
     * Build the frontend appeal link using a token.
     *
     * @param string $token The appeal token
     * @return string
     */
    private function buildAppealFrontendLink(string $token): string
    {
        $baseUrl = rtrim((string) config('app.frontend_url'), '/');

        return $baseUrl . '/en/appeal?token=' . urlencode($token);
    }
}
