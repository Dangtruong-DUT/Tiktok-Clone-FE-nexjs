<?php
namespace App\Http\Requests\User;

use App\Http\Requests\BaseListRequest;

class GetListUserRequest extends BaseListRequest
{
    /**
     * set rules
     *
     * @return array
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
                'q'=> [
                    self::SOMETIMES,
                    self::REQUIRED,
                ],
                'page' => [
                    self::SOMETIMES,
                    self::REQUIRED,
                ],
                'per_page' => [
                    self::SOMETIMES,
                    self::REQUIRED,
                ],
                'verify_status' => [
                    self::SOMETIMES,
                    self::REQUIRED,
                ],
                'role' => [
                    self::SOMETIMES,
                    self::REQUIRED,
                ],

        ]);
    }
}
