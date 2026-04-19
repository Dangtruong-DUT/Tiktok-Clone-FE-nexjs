<?php

namespace App\Http\Requests\Admin\Post;

use App\Http\Requests\BaseListRequest;

class HidePostRequest extends BaseListRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'post_uuid' => $this->route('post_uuid'),
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
            'post_uuid' => [
                self::REQUIRED,
            ],
            'reason' => [
                self::REQUIRED,
                self::STRING,
                self::MIN . ':10',
                self::MAX . ':500'
            ],
        ]);
    }
}
