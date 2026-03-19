<?php
namespace App\Http\Requests\User;

use App\Http\Requests\BaseRequest;

class UnFollowSomeOneRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();
        $this->merge([
            'user_id' => $this->route('user_id'),
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
                'user_id' => [
                    self::REQUIRED
                ],
        ]);
    }
}
