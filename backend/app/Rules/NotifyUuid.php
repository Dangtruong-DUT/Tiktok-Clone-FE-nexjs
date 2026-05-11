<?php

namespace App\Rules;

use App\Repositories\NotificationRepository;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NotifyUuid implements ValidationRule
{
    private readonly NotificationRepository $notificationRepository;

    public function __construct()
    {
        $this->notificationRepository = app()->make(NotificationRepository::class);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
 */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $this->notificationRepository->isExistByUuid($value)) {
            $fail(':attribute must be a valid notification uuid.');
        }
    }
}
