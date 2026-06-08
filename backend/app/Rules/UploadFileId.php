<?php

namespace App\Rules;

use App\Repositories\UploadFileRepository;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UploadFileId implements ValidationRule
{
    private readonly UploadFileRepository $uploadFileRepository;

    public function __construct()
    {
        $this->uploadFileRepository = app()->make(UploadFileRepository::class);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $this->uploadFileRepository->isExist($value)) {
            $fail(':attribute must be a valid upload file id.');
        }
    }
}
