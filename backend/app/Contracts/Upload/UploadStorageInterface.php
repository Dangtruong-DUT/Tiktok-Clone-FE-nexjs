<?php

namespace App\Contracts\Upload;

use App\DTOs\Upload\MultipartCompleteDto;
use App\DTOs\Upload\PresignedPartDto;

interface UploadStorageInterface
{
    /**
     * Generate a presigned PUT URL for a single-file upload.
     */
    public function presignedPutUrl(string $key, int $ttlSeconds = 3600): string;

    /**
     * Initiate a multipart upload and return the provider-specific upload ID.
     */
    public function initiateMultipartUpload(string $key, string $mimeType = 'application/octet-stream'): string;

    /**
     * Generate a presigned URL for uploading a single part in a multipart upload.
     */
    public function presignedPartUrl(string $key, string $uploadId, int $partNumber, int $ttlSeconds = 3600): PresignedPartDto;

    /**
     * Complete a multipart upload by assembling all uploaded parts.
     *
     * @param  MultipartCompleteDto[]  $parts
     */
    public function completeMultipartUpload(string $key, string $uploadId, array $parts): void;

    /**
     * Abort an in-progress multipart upload, freeing any stored parts.
     */
    public function abortMultipartUpload(string $key, string $uploadId): void;

    /**
     * Check whether an object exists in the bucket.
     */
    public function objectExists(string $key): bool;

    /**
     * Delete a single object from storage.
     */
    public function deleteObject(string $key): void;

    /**
     * Delete all objects under a given key prefix.
     */
    public function deleteObjectsByPrefix(string $prefix): void;
}
