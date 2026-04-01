<?php

namespace App\Http\Requests\Notification;

use App\Enums\Notification\NotificationTabEnum;
use App\Http\Requests\BaseListRequest;
use Illuminate\Validation\Rules\Enum;

class GetListNotificationRequest extends BaseListRequest
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
