<?php

namespace App\Services\Video;

use App\Actions\Video\DeleteVideoUploadAction;
use App\Actions\Video\RetryVideoEncodingAction;
use App\Enums\Video\VideoEncodingStatusEnum;
use App\Exceptions\http\BadRequestException;
use App\Models\UploadFile;
use App\Models\VideoEncoding;
use App\Repositories\MediaRepository;
use App\Repositories\UploadFileRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class VideoEncodingService
{
    /**
     * Create a new service instance.
     *
     * @param  UploadFileRepository  $uploadFileRepository
     * @param  MediaRepository  $mediaRepository
     */
    public function __construct(
        private readonly UploadFileRepository $uploadFileRepository,
        private readonly MediaRepository $mediaRepository,
    ) {}

    /**
     * Get the video encoding associated with a given upload file UUID.
     *
     * @param string $uuid The UUID of the upload file.
     * @return VideoEncoding The video encoding associated with the upload file.
     */
    public function getEncodingByFileUuid(string $uuid): VideoEncoding
    {
        $uploadFile = $this->uploadFileRepository->query()->where('uuid', $uuid)
            ->with('videoEncoding')
            ->firstOrFail();

        $encoding = $uploadFile->videoEncoding;

        if (! $encoding) {
            throw new ModelNotFoundException;
        }

        return $encoding;
    }

    /**
     * Retry a failed video encoding job.
     *
     * @param  string  $uuid
     * @param  RetryVideoEncodingAction  $action
     * @return void
     */
    public function retryFailedEncoding(string $uuid, RetryVideoEncodingAction $action): void
    {
        $encoding = $this->getEncodingByFileUuid($uuid);

        if ($encoding->status !== VideoEncodingStatusEnum::FAILED) {
            throw new BadRequestException('Encoding can only be retried when status is FAILED');
        }

        $action->execute($encoding);
    }

    /**
     * Delete an uploaded video that is not linked to any post.
     *
     * @param  string  $uuid
     * @param  DeleteVideoUploadAction  $action
     * @return void
     */
    public function deleteUploadByUuid(string $uuid, DeleteVideoUploadAction $action): void
    {
        /** @var UploadFile $uploadFile */
        $uploadFile = $this->uploadFileRepository->query()->where('uuid', $uuid)->firstOrFail();

        if ($this->mediaRepository->query()->where('upload_file_id', $uploadFile->id)->exists()) {
            throw new BadRequestException('Cannot delete a video linked to a post');
        }

        $action->execute($uploadFile);
    }
}
