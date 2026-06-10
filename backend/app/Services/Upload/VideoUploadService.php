<?php

namespace App\Services\Upload;

use App\Actions\Video\InitiateVideoProcessingAction;
use App\Contracts\Upload\UploadStorageInterface;
use App\DTOs\Upload\MultipartCompleteDto;
use App\DTOs\Upload\PresignedPartDto;
use App\Enums\Video\UploadTypeEnum;
use App\Enums\Video\VideoUploadStatusEnum;
use App\Models\User;
use App\Enums\Video\VideoEncodingStatusEnum;
use App\Exceptions\http\BusinessException;
use App\Exceptions\http\ForbiddenException;
use App\Models\VideoEncoding;
use App\Models\VideoUploadSession;
use App\Repositories\VideoUploadSessionRepository;
use App\Repositories\UploadFileRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class VideoUploadService
{
    /**
     * Create a new service instance.
     *
     * @param  UploadStorageInterface  $storage
     * @param  VideoUploadSessionRepository  $videoUploadSessionRepository
     * @param  UploadFileRepository  $uploadFileRepository
     * @param  InitiateVideoProcessingAction  $initiateProcessing
     */
    public function __construct(
        private readonly UploadStorageInterface $storage,
        private readonly VideoUploadSessionRepository $videoUploadSessionRepository,
        private readonly UploadFileRepository $uploadFileRepository,
        private readonly InitiateVideoProcessingAction $initiateProcessing,
    ) {}

    /**
     * Initialize a new upload session and return the session with its initial upload URL.
     *
     * @param  User  $user
     * @param  string  $fileName
     * @param  int  $fileSize
     * @param  string  $mimeType
     * @return array{session: VideoUploadSession, presigned_url: string|null}
     */
    public function initSession(User $user, string $fileName, int $fileSize, string $mimeType): array
    {
        $threshold    = (int) config('video.upload.multipart_threshold_bytes');
        $useMultipart = $fileSize >= $threshold;
        $storageKey   = $this->buildStorageKey($fileName);
        $uploadId     = null;
        $presignedUrl = null;

        // Create the DB record first so we always have a session to clean up,
        // even if the subsequent S3 call fails.
        $session = VideoUploadSession::create([
            'user_id'     => $user->id,
            'file_name'   => $fileName,
            'mime_type'   => $mimeType,
            'file_size'   => $fileSize,
            'disk'        => 's3',
            'storage_key' => $storageKey,
            'upload_id'   => null,
            'upload_type' => $useMultipart ? UploadTypeEnum::MULTIPART : UploadTypeEnum::SINGLE,
            'status'      => VideoUploadStatusEnum::PENDING,
            'expires_at'  => now()->addHours((int) config('video.upload.session_ttl_hours')),
        ]);

        if ($useMultipart) {
            $uploadId = $this->storage->initiateMultipartUpload($storageKey, $mimeType);
            $session->update(['upload_id' => $uploadId]);
        } else {
            $ttl          = (int) config('video.upload.presigned_ttl_seconds');
            $presignedUrl = $this->storage->presignedPutUrl($storageKey, $ttl);
        }

        return ['session' => $session, 'presigned_url' => $presignedUrl];
    }

    /**
     * Generate a presigned URL for a multipart upload part.
     *
     * @param  VideoUploadSession  $session
     * @param  int  $partNumber
     * @return PresignedPartDto
     */
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
     * Retrieve an upload session by UUID and verify ownership.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return VideoUploadSession
     */
    public function getOwnedSessionByUuid(string $uuid, int $userId): VideoUploadSession
    {
        $session = $this->videoUploadSessionRepository->findByUuid($uuid);

        if ($session === null) {
            abort(404, 'Upload session not found.');
        }

        if (! $session->isOwnedBy($userId)) {
            throw new ForbiddenException('You do not have permission to access this upload session.');
        }

        return $session;
    }

    /**
     * Generate a part upload URL for a session identified by UUID.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @param  int  $partNumber
     * @return PresignedPartDto
     */
    public function getPartUrlByUuid(string $uuid, int $userId, int $partNumber): PresignedPartDto
    {
        $session = $this->getOwnedSessionByUuid($uuid, $userId);

        if ($session->upload_type !== UploadTypeEnum::MULTIPART) {
            throw new BusinessException('This session is not a multipart upload.');
        }

        return $this->getPartUrl($session, $partNumber);
    }

    /**
     * Complete an upload session and trigger downstream video processing.
     *
     * @param  VideoUploadSession  $session
     * @param  array<string,mixed>  $payload
     * @return VideoUploadSession
     */
    public function completeSession(VideoUploadSession $session, array $payload = []): VideoUploadSession
    {
        return DB::transaction(function () use ($session, $payload): VideoUploadSession {
            /** @var VideoUploadSession $session */
            $session = VideoUploadSession::lockForUpdate()->findOrFail($session->id);

            $this->assertCompletable($session);
            $parts = $this->resolveCompletionParts($payload);

            if ($session->upload_type === UploadTypeEnum::MULTIPART) {
                if (empty($parts)) {
                    throw new BusinessException('Parts are required to complete a multipart upload.');
                }

                $this->storage->completeMultipartUpload(
                    $session->storage_key,
                    $session->upload_id,
                    $parts,
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

    /**
     * Abort an upload session and clean up related storage artifacts.
     *
     * @param  VideoUploadSession  $session
     * @return void
     */
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

    /**
     * Complete an upload session identified by UUID.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @param  array<string,mixed>  $payload
     * @return VideoUploadSession
     */
    public function completeSessionByUuid(string $uuid, int $userId, array $payload = []): VideoUploadSession
    {
        return $this->completeSession($this->getOwnedSessionByUuid($uuid, $userId), $payload);
    }

    /**
     * Abort an upload session identified by UUID.
     *
     * @param  string  $uuid
     * @param  int  $userId
     * @return void
     */
    public function abortSessionByUuid(string $uuid, int $userId): void
    {
        $this->abortSession($this->getOwnedSessionByUuid($uuid, $userId));
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
            throw new BusinessException(
                "Session [{$session->uuid}] cannot be completed from status [{$session->status->label()}]."
            );
        }
    }

    /**
     * @param  array<string,mixed>  $payload
     * @return MultipartCompleteDto[]|null
     */
    private function resolveCompletionParts(array $payload): ?array
    {
        $parts = $payload['parts'] ?? null;

        if (empty($parts) || ! is_array($parts)) {
            return null;
        }

        return array_map(
            fn (array $part) => new MultipartCompleteDto(
                partNumber: (int) $part['part_number'],
                etag: '"' . trim((string) $part['etag'], '"') . '"',
            ),
            $parts
        );
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
