<?php

namespace App\Events\Social;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserFollowedEvent
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly int $actorId,
        public readonly int $targetUserId,
    ) {}
}
