<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Repositories\UserRepository;

class UserId implements ValidationRule
{
    protected UserRepository $userRepository;

    public function __construct()
    {
        $this->userRepository = app()->make(UserRepository::class);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$this->userRepository->isExist($value)) {
            $fail(':attribute must be a valid user id.');
        }
    }
}
