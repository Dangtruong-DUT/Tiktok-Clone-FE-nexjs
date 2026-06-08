<?php

namespace App\Events\Social;

use App\Models\Post;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserMentionedEvent
{
    use Dispatchable;
    use SerializesModels;

    /**
     * @param  array<int, int>  $mentionedUserIds
     */
    public function __construct(
        public readonly int $actorId,
        public readonly Post $post,
        public readonly array $mentionedUserIds,
    ) {}
}
