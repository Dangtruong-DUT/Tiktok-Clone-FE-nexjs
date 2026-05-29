<?php

namespace App\Rules;

use App\Enums\Video\VideoUploadStatusEnum;
use App\Repositories\VideoUploadSessionRepository;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class VideoSessionUuid implements ValidationRule
{
    private readonly VideoUploadSessionRepository $repository;

    public function __construct()
    {
        $this->repository = app(VideoUploadSessionRepository::class);
    }

    /**
     * Validate that the value is a session UUID owned by the authenticated user
     * and that the session is in a usable (non-failed, non-canceled) state.
     *
     * @param  string   $attribute  The attribute name being validated.
     * @param  mixed    $value      The UUID value from the request.
     * @param  Closure  $fail       Callback to invoke with an error message on failure.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $session = $this->repository->findByUuidForUser($value, auth_user_id());

        if (! $session) {
            $fail(':attribute must be a valid video upload session belonging to you.');

            return;
        }

        $unusableStatuses = [
            VideoUploadStatusEnum::CANCELED,
            VideoUploadStatusEnum::FAILED,
        ];

        if (in_array($session->status, $unusableStatuses, strict: true)) {
            $fail(':attribute upload session is in a failed or canceled state and cannot be used.');
        }
    }
}
