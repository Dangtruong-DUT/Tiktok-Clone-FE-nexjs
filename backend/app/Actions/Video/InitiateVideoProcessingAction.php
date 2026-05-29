<?php

namespace App\Actions\Video;

use App\Enums\Video\VideoEncodingStatusEnum;
use App\Jobs\ProcessVideoToHlsJob;
use App\Models\UploadFile;
use App\Models\VideoEncoding;

class InitiateVideoProcessingAction
{
    /**
     * Create a VideoEncoding record and dispatch the HLS processing job.
     *
     * @param  UploadFile  $uploadFile  The file to be encoded.
     * @param  int|null    $sessionId   ID of the VideoUploadSession to sync status updates into.
     * @return VideoEncoding            The newly created encoding record.
     */
    public function execute(UploadFile $uploadFile, ?int $sessionId = null): VideoEncoding
    {
        $videoEncoding = VideoEncoding::create([
            'upload_file_id'    => $uploadFile->id,
            'status'            => VideoEncodingStatusEnum::PENDING,
            'encoding_progress' => 0,
        ]);

        ProcessVideoToHlsJob::dispatch($videoEncoding, $sessionId);

        return $videoEncoding;
    }
}
