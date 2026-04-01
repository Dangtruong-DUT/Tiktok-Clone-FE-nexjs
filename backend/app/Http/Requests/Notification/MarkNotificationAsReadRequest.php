<?php

namespace App\Http\Requests\Notification;

use App\Http\Requests\BaseRequest;

class MarkNotificationAsReadRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'notification_uuid' => $this->route('notification_uuid'),
        ]);
    }

    public function rules(): array
    {
        return $this->applyBaseRules([
            'notification_uuid' => [
                self::REQUIRED,
            ],
        ]);
    }
}
