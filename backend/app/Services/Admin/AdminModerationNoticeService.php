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
        private readonly NotificationService $notificationService,
    ) {}

    /**
     * Send moderation notice to user with optional appeal link
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
        $appealType = $this->resolveAppealType($action);
        $resourceType = (string) ($context['resource_type'] ?? $entityType->value);
        $resourceId = (int) ($context['resource_id'] ?? $entityId);

        $appealLink = $appealType !== null
            ? $this->buildAppealLink($appealType, $resourceType, $resourceId)
            : null;

        $notificationData = [
            'action' => $action->value,
            'action_label' => $action->label(),
            'reason' => $reason,
            'appeal_type' => $appealType?->value,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'appeal_link' => $appealLink,
            'appeal_api_url' => rtrim((string) config('app.url'), '/') . '/api/v1/appeals',
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
                admin: $admin,
                action: $action,
                reason: $reason,
                appealLink: $appealLink,
                notificationData: $notificationData,
            ));
        } catch (\Throwable $exception) {
            Log::warning('Failed to queue moderation email', [
                'target_user_id' => $targetUser->id,
                'action' => $action->value,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function resolveAppealType(AdminActionEnum $action): ?AppealTypeEnum
    {
        return match ($action) {
            AdminActionEnum::BAN => AppealTypeEnum::USER_BAN,
            AdminActionEnum::HIDE_POST => AppealTypeEnum::POST_HIDDEN,
            AdminActionEnum::DELETE_POST => AppealTypeEnum::POST_DELETED,
            AdminActionEnum::DELETE_COMMENT => AppealTypeEnum::COMMENT_DELETED,
            default => null,
        };
    }

    private function buildAppealLink(AppealTypeEnum $appealType, string $resourceType, int $resourceId): string
    {
        $baseUrl = rtrim((string) config('app.frontend_url'), '/');

        return $baseUrl
            . '/en/appeals?appeal_type=' . urlencode($appealType->value)
            . '&resource_type=' . urlencode($resourceType)
            . '&resource_id=' . urlencode((string) $resourceId);
    }
}
