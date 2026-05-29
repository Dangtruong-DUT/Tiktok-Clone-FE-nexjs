<?php

namespace App\Actions\Video;

use App\Contracts\Upload\UploadFileServiceInterface;
use App\Contracts\Upload\UploadStorageInterface;
use App\Models\UploadFile;

class DeleteVideoUploadAction
{
    public function __construct(
        private readonly UploadFileServiceInterface $uploadFileService,
        private readonly UploadStorageInterface $storage,
    ) {}

    public function execute(UploadFile $uploadFile): void
    {
        $hlsPrefix = rtrim(config('video.hls_storage_prefix', 'hls'), '/');

        $this->storage->deleteObjectsByPrefix("{$hlsPrefix}/{$uploadFile->uuid}");

        $this->uploadFileService->deleteFile($uploadFile);
    }
}
