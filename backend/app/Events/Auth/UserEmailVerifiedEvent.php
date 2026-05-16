<?php

namespace App\Events\Auth;

use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserEmailVerifiedEvent
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(public readonly User $user) {}
}
