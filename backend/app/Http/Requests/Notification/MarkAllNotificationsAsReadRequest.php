<?php

namespace App\Http\Requests\Notification;

use App\Http\Requests\BaseRequest;

class MarkAllNotificationsAsReadRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'tab' => $this->input('tab', 'all'),
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
        ]);
    }
}
