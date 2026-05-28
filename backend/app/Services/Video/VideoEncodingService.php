<?php

namespace App\Services\Video;

use App\Models\UploadFile;
use App\Models\VideoEncoding;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class VideoEncodingService
{
    public function getEncodingByFileUuid(string $uuid): VideoEncoding
    {
        $uploadFile = UploadFile::where('uuid', $uuid)
            ->with('videoEncoding')
            ->firstOrFail();

        $encoding = $uploadFile->videoEncoding;

        if (! $encoding) {
            throw new ModelNotFoundException;
        }

        return $encoding;
    }
}
