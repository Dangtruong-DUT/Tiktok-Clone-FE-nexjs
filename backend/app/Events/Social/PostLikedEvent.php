<?php

namespace App\Events\Social;

use App\Models\Post;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostLikedEvent
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public readonly int $actorId,
        public readonly Post $post,
    ) {}
}
