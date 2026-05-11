<?php

namespace App\Rules;

use App\Repositories\UploadFileRepository;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class UploadFileId implements ValidationRule
{
    private readonly UploadFileRepository $uploadFileRepo;

    public function __construct()
    {
        $this->uploadFileRepo = app()->make(UploadFileRepository::class);
    }

    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
 */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! $this->uploadFileRepo->isExist($value)) {
            $fail(':attribute must be a valid upload file id.');
        }
    }
}
