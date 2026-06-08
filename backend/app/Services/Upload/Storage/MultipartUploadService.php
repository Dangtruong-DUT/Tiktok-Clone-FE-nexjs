<?php

namespace App\Services\Upload\Storage;

use App\DTOs\Upload\MultipartCompleteDto;
use Aws\S3\S3Client;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Manages the multipart upload lifecycle: initiate, complete, abort.
 */
class MultipartUploadService
{
    public function __construct(
        private readonly S3Client $apiClient,
        private readonly string $bucket,
    ) {}

    /**
     * Initiate a multipart upload and return the UploadId.
     */
    public function initiateMultipartUpload(string $key, string $mimeType = 'application/octet-stream'): string
    {
        $result = $this->apiClient->createMultipartUpload([
            'Bucket'      => $this->bucket,
            'Key'         => $key,
            'ContentType' => $mimeType,
        ]);

        return $result['UploadId'];
    }

    /**
     * Complete a multipart upload by assembling the uploaded parts.
     * ETags are normalized (surrounding quotes stripped) before forwarding to S3.
     *
     * @param  MultipartCompleteDto[]  $parts
     *
     * @throws \InvalidArgumentException  when the parts array is empty
     */
    public function completeMultipartUpload(string $key, string $uploadId, array $parts): void
    {
        if (empty($parts)) {
            throw new \InvalidArgumentException('Parts array cannot be empty.');
        }

        $this->apiClient->completeMultipartUpload([
            'Bucket'          => $this->bucket,
            'Key'             => $key,
            'UploadId'        => $uploadId,
            'MultipartUpload' => [
                'Parts' => array_map(
                    fn (MultipartCompleteDto $part) => [
                        'PartNumber' => $part->partNumber,
                        // Strip surrounding quotes: MinIO sometimes omits them, browsers sometimes include them.
                        'ETag' => trim($part->etag, '"'),
                    ],
                    $parts,
                ),
            ],
        ]);
    }

    /**
     * Abort a multipart upload, releasing any uploaded parts.
     * Logs a warning on failure (upload may have already expired or been completed).
     */
    public function abortMultipartUpload(string $key, string $uploadId): void
    {
        try {
            $this->apiClient->abortMultipartUpload([
                'Bucket'   => $this->bucket,
                'Key'      => $key,
                'UploadId' => $uploadId,
            ]);
        } catch (Throwable $e) {
            Log::warning('abortMultipartUpload failed (may already be completed/expired)', [
                'bucket'    => $this->bucket,
                'key'       => $key,
                'upload_id' => $uploadId,
                'error'     => $e->getMessage(),
            ]);
        }
    }
}
