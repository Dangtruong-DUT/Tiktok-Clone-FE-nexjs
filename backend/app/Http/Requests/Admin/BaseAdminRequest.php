<?php

namespace App\Http\Requests\Admin;

use App\Enums\User\RoleTypeEnum;
use App\Http\Requests\BaseRequest;

/**
 * Base class for all admin requests
 * Handles authorization check and common validation patterns
 *
 * All admin endpoints must use requests extending this class
 */
abstract class BaseAdminRequest extends BaseRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        $user = $this->user();

        // User must be authenticated
        if ($user === null) {
            return false;
        }

        // User must have SUPER_ADMIN role
        return $user->role === RoleTypeEnum::SUPER_ADMIN;
    }
}
