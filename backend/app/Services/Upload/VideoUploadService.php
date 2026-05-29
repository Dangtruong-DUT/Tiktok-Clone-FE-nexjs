<?php

namespace App\Services\Upload;

use App\Actions\Video\InitiateVideoProcessingAction;
use App\Contracts\Upload\UploadStorageInterface;
use App\DTOs\Upload\MultipartCompleteDto;
use App\DTOs\Upload\PresignedPartDto;
use App\Enums\Video\UploadTypeEnum;
use App\Enums\Video\VideoUploadStatusEnum;
use App\Exceptions\Video\InvalidUploadStateException;
use App\Exceptions\Video\UploadVerificationException;
use App\Models\User;
use App\Enums\Video\VideoEncodingStatusEnum;
use App\Models\VideoEncoding;
use App\Models\VideoUploadSession;
use App\Repositories\UploadFileRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class VideoUploadService
{
    public function __construct(
        private readonly UploadStorageInterface $storage,
        private readonly UploadFileRepository $uploadFileRepository,
        private readonly InitiateVideoProcessingAction $initiateProcessing,
    ) {}

    /**
     * @return array{session: VideoUploadSession, presigned_url: string|null}
     */
    public function initSession(User $user, string $fileName, int $fileSize, string $mimeType): array
    {
        $threshold    = (int) config('video.upload.multipart_threshold_bytes');
        $useMultipart = $fileSize >= $threshold;
        $storageKey   = $this->buildStorageKey($fileName);
        $uploadId     = null;
        $presignedUrl = null;

        if ($useMultipart) {
            $uploadId = $this->storage->initiateMultipartUpload($storageKey);
        } else {
            $ttl          = (int) config('video.upload.presigned_ttl_seconds');
            $presignedUrl = $this->storage->presignedPutUrl($storageKey, $ttl);
        }

        $session = VideoUploadSession::create([
            'user_id'     => $user->id,
            'file_name'   => $fileName,
            'mime_type'   => $mimeType,
            'file_size'   => $fileSize,
            'disk'        => config('filesystems.default', 's3'),
            'storage_key' => $storageKey,
            'upload_id'   => $uploadId,
            'upload_type' => $useMultipart ? UploadTypeEnum::MULTIPART : UploadTypeEnum::SINGLE,
            'status'      => VideoUploadStatusEnum::PENDING,
            'expires_at'  => now()->addHours((int) config('video.upload.session_ttl_hours')),
        ]);

        return ['session' => $session, 'presigned_url' => $presignedUrl];
    }

    public function getPartUrl(VideoUploadSession $session, int $partNumber): PresignedPartDto
    {
        $part = $this->storage->presignedPartUrl(
            $session->storage_key,
            $session->upload_id,
            $partNumber,
        );

        $session->update(['status' => VideoUploadStatusEnum::UPLOADING]);

        return $part;
    }

    /**
     * @param  MultipartCompleteDto[]|null  $parts
     * @throws InvalidUploadStateException
     * @throws UploadVerificationException
     */
    public function completeSession(VideoUploadSession $session, ?array $parts): VideoUploadSession
    {
        return DB::transaction(function () use ($session, $parts): VideoUploadSession {
            /** @var VideoUploadSession $session */
            $session = VideoUploadSession::lockForUpdate()->findOrFail($session->id);

            $this->assertCompletable($session);

            if ($session->upload_type === UploadTypeEnum::MULTIPART) {
                if (empty($parts)) {
                    throw new InvalidUploadStateException('Parts are required to complete a multipart upload.');
                }

                $this->storage->completeMultipartUpload(
                    $session->storage_key,
                    $session->upload_id,
                    $parts,
                );
            }

            if (! $this->storage->objectExists($session->storage_key)) {
                throw new UploadVerificationException(
                    "Object [{$session->storage_key}] not found on storage after upload."
                );
            }

            $uploadFile = $this->uploadFileRepository->create([
                'file_name'  => $session->file_name,
                'mime_type'  => $session->mime_type,
                'file_size'  => $session->file_size,
                'file_path'  => $session->storage_key,
                'disk'       => $session->disk,
                'expires_at' => $session->expires_at,
            ]);

            /** @var VideoEncoding $videoEncoding */
            $videoEncoding = $this->initiateProcessing->execute($uploadFile, $session->id);

            $session->update([
                'status'            => VideoUploadStatusEnum::UPLOADED,
                'upload_file_id'    => $uploadFile->id,
                'video_encoding_id' => $videoEncoding->id,
            ]);

            return $session->refresh();
        });
    }

    public function abortSession(VideoUploadSession $session): void
    {
        DB::transaction(function () use ($session): void {
            /** @var VideoUploadSession $session */
            $session = VideoUploadSession::lockForUpdate()->findOrFail($session->id);

            // Already canceled — nothing left to clean up.
            if ($session->status === VideoUploadStatusEnum::CANCELED) {
                return;
            }

            $this->cleanupStorage($session);
            $this->cancelVideoEncoding($session);

            $session->update(['status' => VideoUploadStatusEnum::CANCELED]);
            $session->delete();
        });
    }

    private function buildStorageKey(string $fileName): string
    {
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION)) ?: 'mp4';

        return sprintf('uploads/raw/%s/%s.%s', Str::uuid(), Str::uuid(), $extension);
    }

    private function assertCompletable(VideoUploadSession $session): void
    {
        $completable = [VideoUploadStatusEnum::PENDING, VideoUploadStatusEnum::UPLOADING];

        if (! in_array($session->status, $completable, strict: true)) {
            throw new InvalidUploadStateException(
                "Session [{$session->uuid}] cannot be completed from status [{$session->status->label()}]."
            );
        }
    }

    private function cleanupStorage(VideoUploadSession $session): void
    {
        if (! $session->storage_key) {
            return;
        }

        if ($session->upload_type === UploadTypeEnum::MULTIPART && $session->upload_id) {
            $this->storage->abortMultipartUpload($session->storage_key, $session->upload_id);
        }

        // Raw file exists for every status except PENDING/UPLOADING (not yet uploaded)
        // and CANCELED (already deleted in a prior abort).
        $statusesWithoutRawFile = [
            VideoUploadStatusEnum::PENDING,
            VideoUploadStatusEnum::UPLOADING,
            VideoUploadStatusEnum::CANCELED,
        ];

        if (! in_array($session->status, $statusesWithoutRawFile, strict: true)) {
            $this->storage->deleteObject($session->storage_key);
        }

        if ($session->videoEncoding?->master_playlist_path) {
            $this->storage->deleteObjectsByPrefix(dirname($session->videoEncoding->master_playlist_path));
        }
    }

    private function cancelVideoEncoding(VideoUploadSession $session): void
    {
        if (! $session->video_encoding_id) {
            return;
        }

        try {
            VideoEncoding::where('id', $session->video_encoding_id)
                ->whereNotIn('status', [
                    VideoEncodingStatusEnum::READY->value,
                    VideoEncodingStatusEnum::FAILED->value,
                ])
                ->update([
                    'status'        => VideoEncodingStatusEnum::FAILED,
                    'error_message' => 'Upload session was canceled by user.',
                    'completed_at'  => now(),
                ]);
        } catch (Throwable $e) {
            Log::warning('Failed to cancel VideoEncoding on abort', [
                'video_encoding_id' => $session->video_encoding_id,
                'error'             => $e->getMessage(),
            ]);
        }
    }
}
