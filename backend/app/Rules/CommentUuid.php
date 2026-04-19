<?php

namespace App\Rules;

use App\Repositories\PostRepository;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CommentUuid implements ValidationRule
{
    private readonly PostRepository $postRepository;

    public function __construct()
    {
        $this->postRepository = app()->make(PostRepository::class);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!$this->postRepository->isExistByUuid($value)) {
            $fail(':attribute must be a valid comment uuid.');
        }
    }
}
