<?php

namespace App\Rules;

use App\Repositories\MessageRepository;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class MessageId implements ValidationRule
{
    private readonly MessageRepository $messageRepository;

    public function __construct()
    {
        $this->messageRepository = app()->make(MessageRepository::class);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$this->messageRepository->isExist((int) $value)) {
            $fail(':attribute must be a valid message id.');
        }
    }
}
