<?php

namespace App\Http\Requests\Notification;

use App\Enums\Notification\NotificationTabEnum;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rules\Enum;

class GetUnreadCountNotificationRequest extends BaseRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'tab' => $this->query('tab', NotificationTabEnum::ALL->value),
        ]);
    }

    public function rules(): array
    {
        return $this->applyBaseRules([
            'tab' => [
                self::SOMETIMES,
                self::REQUIRED,
                new Enum(NotificationTabEnum::class),
            ],
        ]);
    }
}
