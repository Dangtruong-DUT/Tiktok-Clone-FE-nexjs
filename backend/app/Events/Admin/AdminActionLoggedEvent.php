<?php

namespace App\Events\Admin;

use App\Enums\Admin\AdminActionEnum;
use App\Enums\Common\ResourceTypeEnum;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminActionLoggedEvent
{
    use Dispatchable;
    use SerializesModels;

    /**
     * @param  array<string, mixed>|null  $oldData
     * @param  array<string, mixed>|null  $newData
     */
    public function __construct(
        public readonly User $admin,
        public readonly ResourceTypeEnum $resourceType,
        public readonly int|string $resourceId,
        public readonly AdminActionEnum $action,
        public readonly ?string $reason = null,
        public readonly ?array $oldData = null,
        public readonly ?array $newData = null,
    ) {}
}
