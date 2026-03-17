<?php
namespace App\Http\Requests\Auth;

use App\Http\Requests\BaseRequest;

class LogoutRequest extends BaseRequest
{
    /**
     * set rules
     *
     * @return array
     */
    public function rules(): array
    {

        return $this->applyBaseRules([
            'refresh_token' => [self::REQUIRED],
        ]);
    }
}
