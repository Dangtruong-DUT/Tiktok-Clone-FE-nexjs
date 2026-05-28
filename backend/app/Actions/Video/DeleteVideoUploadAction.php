<?php

namespace App\Actions\Video;

use App\Libraries\Upload\UploadFileServiceInterface;
use App\Models\UploadFile;
use Illuminate\Support\Facades\Storage;

class DeleteVideoUploadAction
{
    public function __construct(
        private readonly UploadFileServiceInterface $uploadFileService,
    ) {}

    public function execute(UploadFile $uploadFile): void
    {
        $uuid = $uploadFile->uuid;
        $hlsPrefix = rtrim(config('video.hls_storage_prefix', 'hls'), '/');

        Storage::disk('s3')->deleteDirectory("{$hlsPrefix}/{$uuid}");

        $this->uploadFileService->deleteFile($uploadFile);
    }
}
