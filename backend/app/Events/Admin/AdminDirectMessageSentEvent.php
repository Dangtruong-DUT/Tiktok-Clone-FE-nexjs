<?php

namespace App\Events\Admin;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminDirectMessageSentEvent
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly User $admin,
        public readonly User $targetUser,
        public readonly string $subject,
        public readonly string $message,
    ) {}
}
