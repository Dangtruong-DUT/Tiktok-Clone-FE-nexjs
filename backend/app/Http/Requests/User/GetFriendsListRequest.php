<?php
namespace App\Http\Requests\User;

use App\Http\Requests\BaseListRequest;

class GetFriendsListRequest extends BaseListRequest
{
    protected function prepareForValidation()
    {
        parent::prepareForValidation();
        $this->merge([
            'user_uuid' => $this->route('user_uuid'),
        ]);
    }

    /**
     * set rules
     *
     * @return array
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'user_uuid' => [
                self::REQUIRED,
            ],
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
