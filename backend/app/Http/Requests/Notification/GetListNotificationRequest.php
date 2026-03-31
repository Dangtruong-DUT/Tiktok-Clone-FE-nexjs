<?php

namespace App\Http\Requests\Notification;

use App\Http\Requests\BaseListRequest;

class GetListNotificationRequest extends BaseListRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'tab' => $this->query('tab', 'all'),
        ]);
    }

    public function rules(): array
    {
        return $this->applyBaseRules([
            'tab' => [
                self::SOMETIMES,
                self::REQUIRED,
                self::IN . ':all,likes,comments,mentions,followers',
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
