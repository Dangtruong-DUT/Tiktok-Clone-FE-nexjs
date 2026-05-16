<?php

namespace App\Services\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Appeal\AppealTypeEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Events\Admin\AdminModerationActionNotifiedEvent;
use App\Events\Admin\AdminPositiveActionNotifiedEvent;
use App\Models\User;

class AdminModerationNoticeService
{
    /**
     * Send a punitive moderation notice (ban, delete).
     * Includes appeal link if the action is appealable.
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
        $resourceUuid = (string) ($context['resource_uuid'] ?? '');
        $appealLink = null;

        $notificationData = [
            'action' => $action->value,
            'reason' => $reason,
            'resource_type' => $resourceType,
        ];

        if ($resourceUuid !== '') {
            $notificationData['resource_uuid'] = $resourceUuid;
        }

        if (isset($context['appeal_uuid']) && (string) $context['appeal_uuid'] !== '') {
            $notificationData['appeal_uuid'] = (string) $context['appeal_uuid'];
        }

        if ($this->isAppealableAction($action)) {
            $appealType = AppealTypeEnum::fromAdminAction($action);
            if ($appealType === null) {
                throw new \InvalidArgumentException("No appeal type defined for admin action: {$action->value}");
            }

            $notificationData['appeal_type'] = $appealType->value;
            $notificationData['appeal_available'] = true;

            if ($resourceUuid !== '') {
                $appealLink = $this->buildAppealFrontendLink($appealType, $resourceType, $resourceUuid);
                $notificationData['appeal_link'] = $appealLink;
            }
        }

        event(new AdminModerationActionNotifiedEvent(
            admin: $admin,
            targetUser: $targetUser,
            action: $action,
            reason: $reason,
            entityType: $entityType,
            entityId: $entityId,
            notificationData: $notificationData,
            appealLink: $appealLink,
        ));
    }

    /**
     * Send a positive/constructive admin action notice (unban, restore, approve appeal, etc.).
     * No appeal link is included — these are restorative actions.
     * @param  array<string,mixed>  $context  Extra data for the notification (e.g. resource info)
     */
    public function sendPositiveAction(
        User $admin,
        User $targetUser,
        AdminActionEnum $action,
        string $message,
        ModelEntityTypeEnum $entityType,
        int $entityId,
        array $context = []
    ): void {
        $baseData = [
            'action' => $action->value,
            'reason' => $message,
            'resource_type' => $context['resource_type'] ?? $entityType->value,
        ];

        if (isset($context['resource_uuid']) && $context['resource_uuid'] !== '') {
            $baseData['resource_uuid'] = $context['resource_uuid'];
        }

        $notificationData = array_merge($baseData, $context);
        unset($notificationData['resource_id']);

        event(new AdminPositiveActionNotifiedEvent(
            admin: $admin,
            targetUser: $targetUser,
            action: $action,
            message: $message,
            entityType: $entityType,
            entityId: $entityId,
            notificationData: $notificationData,
        ));
    }

    /**
     * Build the frontend appeal link with query parameters.
     */
    private function buildAppealFrontendLink(AppealTypeEnum $appealType, string $resourceType, string $resourceUuid): string
    {
        $baseUrl = rtrim((string) config('app.frontend_url'), '/');

        return $baseUrl.'/en/appeal?'.http_build_query([
            'appeal_type' => $appealType->value,
            'resource_type' => $resourceType,
            'resource_uuid' => $resourceUuid,
        ]);
    }

    /**
     * Determine if the admin action should allow the user to submit an appeal.
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
