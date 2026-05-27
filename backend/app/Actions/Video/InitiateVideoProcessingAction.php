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
     */
    public function execute(UploadFile $uploadFile): VideoEncoding
    {
        $videoEncoding = VideoEncoding::create([
            'upload_file_id' => $uploadFile->id,
            'status' => VideoEncodingStatusEnum::PENDING,
            'encoding_progress' => 0,
        ]);

        ProcessVideoToHlsJob::dispatch($videoEncoding)
            ->onQueue('video-processing');

        return $videoEncoding;
    }
}
