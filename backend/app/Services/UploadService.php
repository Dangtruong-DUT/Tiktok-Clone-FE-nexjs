<?php

namespace App\Services;

use App\Enums\Media\MediaType;
use App\Libraries\Upload\UploadFileServiceInterface;
use Illuminate\Http\UploadedFile;

class UploadService
{

    public function __construct(
        protected UploadFileServiceInterface $uploadFileService
    ) {}

    /**
     * @param UploadedFile $file
     * @return array{url: string, type: string}
     */
    public function uploadImage(UploadedFile $file)
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'images');

        return [
            'url' => $uploadFile->url,
            'type' => MediaType::IMAGE->value,
        ];
    }

    /**
     * @param UploadedFile $file
     * @return array{url: string, type: string}
     */

    public function uploadVideo(UploadedFile $file)
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'videos');

        return [
            'url' => $uploadFile->url,
            'type' => MediaType::VIDEO->value,
        ];
    }
}
