<?php

namespace App\Rules;

use App\Repositories\ConversationRepository;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ConversationId implements ValidationRule
{
    private readonly ConversationRepository $conversationRepository;

    public function __construct()
    {
        $this->conversationRepository = app()->make(ConversationRepository::class);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$this->conversationRepository->isExist((int) $value)) {
            $fail(':attribute must be a valid conversation id.');
        }
    }
}
