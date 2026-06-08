<?php

namespace App\Events\Social;

use App\Models\Post;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostCommentedEvent
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly int $actorId,
        public readonly Post $targetPost,
        public readonly Post $commentPost,
    ) {}
}
