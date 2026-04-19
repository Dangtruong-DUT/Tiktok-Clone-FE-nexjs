<?php

namespace App\Rules;

use App\Repositories\PostRepository;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CommentId implements ValidationRule
{
    private readonly PostRepository $commentRepository;

    public function __construct()
    {
        $this->commentRepository = app()->make(PostRepository::class);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$this->commentRepository->isExist($value)) {
            $fail(':attribute must be a valid comment ID.');
        }
    }
}
