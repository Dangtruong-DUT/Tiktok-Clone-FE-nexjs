<?php

namespace App\Services;

use App\Actions\Video\InitiateVideoProcessingAction;
use App\Enums\Media\MediaTypeEnum;
use App\Libraries\Upload\UploadFileServiceInterface;
use Illuminate\Http\UploadedFile;

class UploadService
{
    public function __construct(
        protected readonly UploadFileServiceInterface $uploadFileService,
        protected readonly InitiateVideoProcessingAction $initiateVideoProcessingAction,
    ) {}

    public function image(UploadedFile $file): array
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'images');

        return [
            'id' => $uploadFile->id,
            'url' => $uploadFile->url,
            'type' => MediaTypeEnum::IMAGE->value,
        ];
    }

    public function video(UploadedFile $file): array
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'videos');

        $this->initiateVideoProcessingAction->execute($uploadFile);

        return [
            'id' => $uploadFile->id,
            'uuid' => $uploadFile->uuid,
            'url' => $uploadFile->url,
            'type' => MediaTypeEnum::VIDEO->value,
        ];
    }
}
