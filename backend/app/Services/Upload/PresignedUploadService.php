<?php

namespace App\Services\Upload;

use App\Contracts\Upload\UploadStorageInterface;
use App\DTOs\Upload\MultipartCompleteDto;
use App\DTOs\Upload\PresignedPartDto;
use App\Services\Upload\Storage\MultipartUploadService;
use App\Services\Upload\Storage\ObjectStorageService;
use App\Services\Upload\Storage\PresignedUrlService;
use App\Services\Upload\Storage\StorageCleanupService;

/**
 * Façade that implements UploadStorageInterface by delegating to focused storage services.
 * Callers (VideoUploadService, etc.) depend only on the interface and are unaffected by
 * the internal split into PresignedUrlService / MultipartUploadService / etc.
 */
class PresignedUploadService implements UploadStorageInterface
{
    public function __construct(
        private readonly PresignedUrlService $presigned,
        private readonly MultipartUploadService $multipart,
        private readonly ObjectStorageService $objects,
        private readonly StorageCleanupService $cleanup,
    ) {}

    /**
     * Create a presigned PUT URL for a single-file upload.
     */
    public function presignedPutUrl(string $key, int $ttlSeconds = 3600): string
    {
        return $this->presigned->presignedPutUrl($key, $ttlSeconds);
    }

    /**
     * Initiate a multipart upload and return the UploadId.
     */
    public function initiateMultipartUpload(string $key, string $mimeType = 'application/octet-stream'): string
    {
        return $this->multipart->initiateMultipartUpload($key, $mimeType);
    }

    /**
     * Create a presigned URL for uploading a single part.
     */
    public function presignedPartUrl(string $key, string $uploadId, int $partNumber, int $ttlSeconds = 3600): PresignedPartDto
    {
        return $this->presigned->presignedPartUrl($key, $uploadId, $partNumber, $ttlSeconds);
    }

    /**
     * Complete a multipart upload by assembling all uploaded parts.
     *
     * @param  MultipartCompleteDto[]  $parts
     */
    public function completeMultipartUpload(string $key, string $uploadId, array $parts): void
    {
        $this->multipart->completeMultipartUpload($key, $uploadId, $parts);
    }

    /**
     * Abort a multipart upload.
     */
    public function abortMultipartUpload(string $key, string $uploadId): void
    {
        $this->multipart->abortMultipartUpload($key, $uploadId);
    }

    /**
     * Check whether an object exists in the bucket.
     */
    public function objectExists(string $key): bool
    {
        return $this->objects->objectExists($key);
    }

    /**
     * Delete a single object.
     */
    public function deleteObject(string $key): void
    {
        $this->objects->deleteObject($key);
    }

    /**
     * Delete all objects whose key starts with the given prefix.
     */
    public function deleteObjectsByPrefix(string $prefix): void
    {
        $this->cleanup->deleteObjectsByPrefix($prefix);
    }
}
