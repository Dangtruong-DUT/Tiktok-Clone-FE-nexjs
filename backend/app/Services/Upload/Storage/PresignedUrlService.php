<?php

namespace App\Services\Upload\Storage;

use App\DTOs\Upload\PresignedPartDto;
use Aws\S3\S3Client;

/**
 * Generates presigned URLs for direct browser-to-storage uploads.
 */
class PresignedUrlService
{
    public function __construct(
        private readonly S3Client $signingClient,
        private readonly string $bucket,
    ) {}

    /**
     * Create a presigned PUT URL for a single-file upload.
     */
    public function presignedPutUrl(string $key, int $ttlSeconds = 3600): string
    {
        $command = $this->signingClient->getCommand('PutObject', [
            'Bucket' => $this->bucket,
            'Key'    => $key,
        ]);

        return (string) $this->signingClient->createPresignedRequest($command, "+{$ttlSeconds} seconds")->getUri();
    }

    /**
     * Create a presigned URL for uploading a single part of a multipart upload.
     *
     * @throws \InvalidArgumentException  when partNumber is outside the S3-allowed range 1–10000
     */
    public function presignedPartUrl(string $key, string $uploadId, int $partNumber, int $ttlSeconds = 3600): PresignedPartDto
    {
        if ($partNumber < 1 || $partNumber > 10_000) {
            throw new \InvalidArgumentException("PartNumber must be between 1 and 10000, got {$partNumber}.");
        }

        $command = $this->signingClient->getCommand('UploadPart', [
            'Bucket'     => $this->bucket,
            'Key'        => $key,
            'UploadId'   => $uploadId,
            'PartNumber' => $partNumber,
        ]);

        $url = (string) $this->signingClient->createPresignedRequest($command, "+{$ttlSeconds} seconds")->getUri();

        return new PresignedPartDto(url: $url, partNumber: $partNumber);
    }
}
