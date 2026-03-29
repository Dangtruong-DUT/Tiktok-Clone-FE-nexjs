<?php
namespace App\Http\Requests\User;

use App\Http\Requests\BaseListRequest;

class GetSuggestedUsersRequest extends BaseListRequest
{
    /**
     * set rules
     *
     * @return array
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'q' => [
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
        ]);
    }
}
