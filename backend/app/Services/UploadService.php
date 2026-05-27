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

    /**
     * Upload an image file and return its metadata.
     * @param  UploadedFile  $file
     * @return array{id: string, url: string, type: string}
     */
    public function image(UploadedFile $file): array
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'images');

        return [
            'id' => $uploadFile->id,
            'url' => $uploadFile->url,
            'type' => MediaTypeEnum::IMAGE->value,
        ];
    }

    /**
     * Upload a video file, dispatch HLS encoding, and return its metadata.
     *
     * The response type is VIDEO while encoding is in progress.
     * Once the job completes, all Media records pointing to this file
     * are upgraded to HLS_VIDEO and the URL resolves to the master playlist.
     *
     * @param  UploadedFile  $file
     * @return array{id: string, url: string, type: string}
     */
    public function video(UploadedFile $file): array
    {
        $uploadFile = $this->uploadFileService->uploadFile($file, 'videos');

        $this->initiateVideoProcessingAction->execute($uploadFile);

        return [
            'id' => $uploadFile->id,
            'url' => $uploadFile->url,
            'type' => MediaTypeEnum::VIDEO->value,
        ];
    }
}
