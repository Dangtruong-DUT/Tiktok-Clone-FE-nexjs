<?php

namespace App\Rules;

use App\Repositories\AppealRepository;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class AppealUuid implements ValidationRule
{
    private readonly AppealRepository $appealRepository;

    public function __construct()
    {
        $this->appealRepository = app()->make(AppealRepository::class);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
 */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $this->appealRepository->isExistByUuid($value)) {
            $fail(':attribute must be a valid appeal UUID.');
        }
    }
}
