<?php

namespace App\Services\Upload;

use App\Actions\Video\InitiateVideoProcessingAction;
use App\Contracts\Upload\UploadFileServiceInterface;
use App\Enums\Media\MediaTypeEnum;
use Illuminate\Http\UploadedFile;

class UploadService
{
    /**
     * Create a new service instance.
     *
     * @param  UploadFileServiceInterface  $uploadFileService
     * @param  InitiateVideoProcessingAction  $initiateVideoProcessingAction
     */
    public function __construct(
        protected readonly UploadFileServiceInterface $uploadFileService,
        protected readonly InitiateVideoProcessingAction $initiateVideoProcessingAction,
    ) {}

    /**
     * Upload an image file and return its payload for API responses.
     *
     * @param  UploadedFile  $file
     * @return array{id: int, url: string, type: string}
     */
    public function image(UploadedFile $file): array
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'images');

        return [
            'id'   => $uploadFile->id,
            'url'  => $uploadFile->url,
            'type' => MediaTypeEnum::IMAGE->value,
        ];
    }

    /**
     * Upload a video file, trigger processing, and return its payload.
     *
     * @param  UploadedFile  $file
     * @return array{id: int, uuid: string, url: string, type: string}
     */
    public function video(UploadedFile $file): array
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'videos');

        $this->initiateVideoProcessingAction->execute($uploadFile);

        return [
            'id'   => $uploadFile->id,
            'uuid' => $uploadFile->uuid,
            'url'  => $uploadFile->url,
            'type' => MediaTypeEnum::VIDEO->value,
        ];
    }
}
