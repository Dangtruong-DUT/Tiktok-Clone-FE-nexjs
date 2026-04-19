<?php

namespace App\Http\Requests\Admin\User;

use App\Http\Requests\BaseRequest;

class SendUserMailRequest extends BaseRequest
{
    /**
     * Prepare the data for validation.
     * Extract user_uuid from route and merge into request data
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
            ],
            'subject' => [self::REQUIRED, self::STRING, self::MIN . ':3', self::MAX . ':150'],
            'message' => [self::REQUIRED, self::STRING, self::MIN . ':10', self::MAX . ':5000'],
        ]);
    }
}
