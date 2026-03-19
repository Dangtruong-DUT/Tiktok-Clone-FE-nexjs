<?php
namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class FollowSomeOneRequest extends BaseRequest
{
    /**
     * set rules
     *
     * @return array
     */
    public function rules(): array
    {

        return $this->applyBaseRules([
                'user_id' => [
                    self::REQUIRED
                ],
        ]);
    }
}