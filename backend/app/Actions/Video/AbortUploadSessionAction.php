<?php

namespace App\Actions\Video;

use App\Models\VideoUploadSession;
use App\Services\Upload\VideoUploadService;

class AbortUploadSessionAction
{
    public function __construct(
        private readonly VideoUploadService $uploadService,
    ) {}

    public function execute(VideoUploadSession $session): void
    {
        $this->uploadService->abortSession($session);
    }
}
