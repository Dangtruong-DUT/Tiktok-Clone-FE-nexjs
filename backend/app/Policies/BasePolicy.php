<?php

namespace App\Policies;

use App\Models\User;

abstract class BasePolicy
{
    /**
     * Create a new policy instance.
     */
    public function __construct()
    {
    }

    /**
     * Handle all abilities for super admin users.
     *
     * @param User $user The user performing the action.
     * @param string $ability The ability being checked.
     * @return bool|null True if the user is a super admin, null to continue checking other policies.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }
}
