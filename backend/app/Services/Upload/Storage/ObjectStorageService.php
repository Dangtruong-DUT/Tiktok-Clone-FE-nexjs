<?php

namespace App\Services\Upload\Storage;

use Aws\S3\Exception\S3Exception;
use Aws\S3\S3Client;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * CRUD operations for individual storage objects.
 */
class ObjectStorageService
{
    public function __construct(
        private readonly S3Client $apiClient,
        private readonly string $bucket,
    ) {}

    /**
     * Check whether an object exists in the bucket.
     *
     * @throws S3Exception  for non-404 S3 errors
     */
    public function objectExists(string $key): bool
    {
        try {
            $this->apiClient->headObject(['Bucket' => $this->bucket, 'Key' => $key]);

            return true;
        } catch (S3Exception $e) {
            if ($e->getStatusCode() === 404) {
                return false;
            }

            throw $e;
        }
    }

    /**
     * Delete a single object from the bucket.
     * Logs a warning on failure but does not rethrow so callers can continue cleanup flows.
     */
    public function deleteObject(string $key): void
    {
        try {
            $this->apiClient->deleteObject(['Bucket' => $this->bucket, 'Key' => $key]);
        } catch (Throwable $e) {
            Log::warning('deleteObject failed', [
                'bucket' => $this->bucket,
                'key'    => $key,
                'error'  => $e->getMessage(),
            ]);
        }
    }
}
