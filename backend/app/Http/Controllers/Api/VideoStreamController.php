<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Models\UploadFile;
use Illuminate\Http\JsonResponse;

class VideoStreamController extends Controller
{
    /**
     * Return the HLS encoding status for a given upload file UUID.
     *
     * Used by the frontend to poll until status === 'ready' or to display
     * the master playlist URL when embedding the HLS player.
     */
    public function encodingStatus(string $uuid): JsonResponse
    {
        $uploadFile = UploadFile::where('uuid', $uuid)
            ->with('videoEncoding')
            ->firstOrFail();

        $encoding = $uploadFile->videoEncoding;

        if (! $encoding) {
            return ApiResponse::notFound('No encoding record found for this file');
        }

        return ApiResponse::success([
            'status' => $encoding->status->value,
            'status_label' => $encoding->status->label(),
            'progress' => $encoding->encoding_progress,
            'master_playlist_url' => $encoding->master_playlist_url,
            'duration' => $encoding->duration,
            'resolutions' => $encoding->resolutions,
        ]);
    }
}
