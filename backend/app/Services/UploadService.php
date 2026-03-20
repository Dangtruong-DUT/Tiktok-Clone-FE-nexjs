<?php

namespace App\Services;

use App\Enums\Media\MediaTypeEnum;
use App\Libraries\Upload\UploadFileServiceInterface;
use Illuminate\Http\UploadedFile;

class UploadService
{

    public function __construct(
        protected readonly UploadFileServiceInterface $uploadFileService
    ) {}

    /**
     * @param UploadedFile $file
     * @return array{url: string, type: string}
     */
    public function uploadImage(UploadedFile $file)
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'images');

        return [
            'id' => $uploadFile->id,
            'url' => $uploadFile->url,
            'type' => MediaTypeEnum::IMAGE->value,
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
            'id' => $uploadFile->id,
            'url' => $uploadFile->url,
            'type' => MediaTypeEnum::VIDEO->value,
        ];
    }
}
