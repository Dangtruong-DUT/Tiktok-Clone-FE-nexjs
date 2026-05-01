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
     * @return array{id: string, url: string, type: string}
     */
    public function image(UploadedFile $file)
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'images');

        return [
            'id' => $uploadFile->id,
            'url' => $uploadFile->url,
            'type' => MediaTypeEnum::IMAGE->value,
        ];
    }

    /**
     * @return array{id: string, url: string, type: string}
     */
    public function video(UploadedFile $file)
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'videos');

        return [
            'id' => $uploadFile->id,
            'url' => $uploadFile->url,
            'type' => MediaTypeEnum::VIDEO->value,
        ];
    }
}
