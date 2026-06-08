<?php

namespace App\Services\Upload\Storage;

use Aws\S3\S3Client;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Batch deletion of objects by key prefix.
 */
class StorageCleanupService
{
    public function __construct(
        private readonly S3Client $apiClient,
        private readonly string $bucket,
    ) {}

    /**
     * Delete all objects whose key starts with the given prefix.
     * Objects are deleted in batches of 1000 (the S3 API maximum per request).
     * Logs a warning on failure but does not rethrow.
     */
    public function deleteObjectsByPrefix(string $prefix): void
    {
        try {
            $normalizedPrefix  = rtrim($prefix, '/') . '/';
            $continuationToken = null;

            do {
                $params = ['Bucket' => $this->bucket, 'Prefix' => $normalizedPrefix];

                if ($continuationToken !== null) {
                    $params['ContinuationToken'] = $continuationToken;
                }

                $listing = $this->apiClient->listObjectsV2($params);

                if (! empty($listing['Contents'])) {
                    // S3 DeleteObjects accepts at most 1000 keys per call.
                    foreach (array_chunk($listing['Contents'], 1000) as $batch) {
                        $this->apiClient->deleteObjects([
                            'Bucket' => $this->bucket,
                            'Delete' => [
                                'Objects' => array_map(fn ($obj) => ['Key' => $obj['Key']], $batch),
                            ],
                        ]);
                    }
                }

                $continuationToken = $listing['IsTruncated'] ? $listing['NextContinuationToken'] : null;
            } while ($continuationToken !== null);
        } catch (Throwable $e) {
            Log::warning('deleteObjectsByPrefix failed', [
                'bucket' => $this->bucket,
                'prefix' => $prefix,
                'error'  => $e->getMessage(),
            ]);
        }
    }
}
