<?php

namespace App\Events\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ModelEntityTypeEnum;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminPositiveActionNotifiedEvent
{
    use Dispatchable;
    use SerializesModels;

    /**
     * @param  array<string, mixed>  $notificationData
     */
    public function __construct(
        public readonly User $admin,
        public readonly User $targetUser,
        public readonly AdminActionEnum $action,
        public readonly string $message,
        public readonly ModelEntityTypeEnum $entityType,
        public readonly int $entityId,
        public readonly array $notificationData,
    ) {}
}
