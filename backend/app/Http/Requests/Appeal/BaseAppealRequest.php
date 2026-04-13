<?php

namespace App\Http\Requests\Appeal;

use App\Http\Requests\BaseFormRequest;

/**
 * BaseAppealRequest - Base class for all appeal-related requests
 */
abstract class BaseAppealRequest extends BaseFormRequest
{    /**
     * Authorize the request - users can only appeal for themselves
     */
    public function authorize(): bool
    {
        return $this->user()->id  === auth_user_id();
    }
}
