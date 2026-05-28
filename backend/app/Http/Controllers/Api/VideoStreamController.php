<?php

namespace App\Http\Controllers\Api;

use App\Actions\Video\DeleteVideoUploadAction;
use App\Actions\Video\RetryVideoEncodingAction;
use App\Enums\Video\VideoEncodingStatusEnum;
use App\Http\Controllers\Controller;
use App\Http\Response\ApiResponse;
use App\Models\Media;
use App\Models\UploadFile;
use App\Services\Video\VideoEncodingService;
use Illuminate\Http\JsonResponse;

class VideoStreamController extends Controller
{
    public function __construct(
        private readonly VideoEncodingService $encodingService,
    ) {}

    public function encodingStatus(string $uuid): JsonResponse
    {
        $encoding = $this->encodingService->getEncodingByFileUuid($uuid);

        return ApiResponse::success([
            'status' => $encoding->status->value,
            'status_label' => $encoding->status->label(),
            'progress' => $encoding->encoding_progress,
            'master_playlist_url' => $encoding->master_playlist_url,
            'duration' => $encoding->duration,
            'width' => $encoding->metadata['original_width'] ?? null,
            'height' => $encoding->metadata['original_height'] ?? null,
            'resolutions' => $encoding->resolutions,
        ]);
    }

    public function retryEncoding(string $uuid, RetryVideoEncodingAction $action): JsonResponse
    {
        $encoding = $this->encodingService->getEncodingByFileUuid($uuid);

        if ($encoding->status !== VideoEncodingStatusEnum::FAILED) {
            return ApiResponse::error('Encoding can only be retried when status is FAILED', 422);
        }

        $action->execute($encoding);

        return ApiResponse::success(['message' => 'Encoding job queued']);
    }

    public function destroy(string $uuid, DeleteVideoUploadAction $action): JsonResponse
    {
        $uploadFile = UploadFile::where('uuid', $uuid)->firstOrFail();

        if (Media::where('upload_file_id', $uploadFile->id)->exists()) {
            return ApiResponse::error('Cannot delete a video linked to a post', 422);
        }

        $action->execute($uploadFile);

        return ApiResponse::success(null, 'Upload cancelled');
    }
}
