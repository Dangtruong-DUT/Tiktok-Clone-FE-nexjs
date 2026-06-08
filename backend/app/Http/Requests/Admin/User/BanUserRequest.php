<?php

namespace App\Http\Requests\Admin\User;

use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class BanUserRequest extends BaseRequest
{
    /**
     * Prepare the data for validation.
     * Extract user_id from route and merge into request data
     */
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'user_uuid' => $this->route('user_uuid'),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return $this->applyBaseRules([
            'user_uuid' => [
                self::REQUIRED,
                Rule::notIn([$this->user()?->uuid]),
            ],
            'reason' => [self::REQUIRED, self::STRING, self::MIN.':10', self::MAX.':500'],
            'duration_days' => [self::NULLABLE, self::INTEGER, self::MIN.':1', self::MAX.':365'],
        ]);
    }
}
