<?php

namespace App\Services\Upload;

use App\DTOs\Upload\MultipartCompleteDto;
use App\DTOs\Upload\PresignedPartDto;
use App\Contracts\Upload\UploadStorageInterface;
use Aws\S3\Exception\S3Exception;
use Aws\S3\S3Client;
use Illuminate\Support\Facades\Log;
use Throwable;

class PresignedUploadService implements UploadStorageInterface
{
    /** Used for server-side API calls (reaches MinIO via internal Docker hostname). */
    private S3Client $s3;

    /** Used only for signing presigned URLs — configured with the public-facing endpoint
     *  so the generated Host in the signature matches what the browser will send. */
    private S3Client $signingS3;

    private string $bucket;

    public function __construct()
    {
        $config = config('filesystems.disks.s3');

        $baseConfig = [
            'version'     => 'latest',
            'region'      => $config['region'] ?? 'us-east-1',
            'credentials' => [
                'key'    => $config['key'],
                'secret' => $config['secret'],
            ],
        ];

        if (! empty($config['use_path_style_endpoint'])) {
            $baseConfig['use_path_style_endpoint'] = (bool) $config['use_path_style_endpoint'];
        }

        // Internal client — uses the Docker-internal endpoint (e.g. http://minio:9000)
        // so server-side API calls (initiate/complete multipart, headObject, delete) work.
        $internalConfig = $baseConfig;
        if (! empty($config['endpoint'])) {
            $internalConfig['endpoint'] = $config['endpoint'];
        }
        $this->s3 = new S3Client($internalConfig);

        // Signing client — uses the public URL (e.g. http://localhost:9000) so the Host
        // baked into presigned URL signatures matches what the browser actually sends.
        // Without this the signature is computed for "minio:9000" but the browser sends
        // "Host: localhost:9000", causing a 403 SignatureDoesNotMatch.
        $publicEndpoint   = rtrim(env('AWS_URL', $config['endpoint'] ?? ''), '/');
        $signingConfig    = $baseConfig;
        if ($publicEndpoint !== '') {
            $signingConfig['endpoint'] = $publicEndpoint;
        }
        $this->signingS3 = new S3Client($signingConfig);

        $this->bucket = $config['bucket'];
    }

    public function presignedPutUrl(string $key, int $ttlSeconds = 3600): string
    {
        $command = $this->signingS3->getCommand('PutObject', [
            'Bucket' => $this->bucket,
            'Key'    => $key,
        ]);

        return (string) $this->signingS3->createPresignedRequest($command, "+{$ttlSeconds} seconds")->getUri();
    }

    public function initiateMultipartUpload(string $key): string
    {
        $result = $this->s3->createMultipartUpload([
            'Bucket'      => $this->bucket,
            'Key'         => $key,
            'ContentType' => 'application/octet-stream',
        ]);

        return $result['UploadId'];
    }

    public function presignedPartUrl(string $key, string $uploadId, int $partNumber, int $ttlSeconds = 3600): PresignedPartDto
    {
        $command = $this->signingS3->getCommand('UploadPart', [
            'Bucket'     => $this->bucket,
            'Key'        => $key,
            'UploadId'   => $uploadId,
            'PartNumber' => $partNumber,
        ]);

        $url = (string) $this->signingS3->createPresignedRequest($command, "+{$ttlSeconds} seconds")->getUri();

        return new PresignedPartDto(url: $url, partNumber: $partNumber);
    }

    public function completeMultipartUpload(string $key, string $uploadId, array $parts): void
    {
        $this->s3->completeMultipartUpload([
            'Bucket'          => $this->bucket,
            'Key'             => $key,
            'UploadId'        => $uploadId,
            'MultipartUpload' => [
                'Parts' => array_map(
                    fn (MultipartCompleteDto $part) => ['PartNumber' => $part->partNumber, 'ETag' => $part->etag],
                    $parts
                ),
            ],
        ]);
    }

    public function abortMultipartUpload(string $key, string $uploadId): void
    {
        try {
            $this->s3->abortMultipartUpload([
                'Bucket'   => $this->bucket,
                'Key'      => $key,
                'UploadId' => $uploadId,
            ]);
        } catch (Throwable $e) {
            Log::warning('abortMultipartUpload failed (may already be completed/expired)', [
                'key'       => $key,
                'upload_id' => $uploadId,
                'error'     => $e->getMessage(),
            ]);
        }
    }

    public function objectExists(string $key): bool
    {
        try {
            $this->s3->headObject(['Bucket' => $this->bucket, 'Key' => $key]);

            return true;
        } catch (S3Exception) {
            return false;
        }
    }

    public function deleteObject(string $key): void
    {
        try {
            $this->s3->deleteObject(['Bucket' => $this->bucket, 'Key' => $key]);
        } catch (Throwable $e) {
            Log::warning('deleteObject failed', ['key' => $key, 'error' => $e->getMessage()]);
        }
    }

    public function deleteObjectsByPrefix(string $prefix): void
    {
        try {
            $objects = $this->s3->listObjectsV2([
                'Bucket' => $this->bucket,
                'Prefix' => rtrim($prefix, '/') . '/',
            ]);

            if (empty($objects['Contents'])) {
                return;
            }

            $this->s3->deleteObjects([
                'Bucket' => $this->bucket,
                'Delete' => [
                    'Objects' => array_map(
                        fn ($obj) => ['Key' => $obj['Key']],
                        $objects['Contents']
                    ),
                ],
            ]);
        } catch (Throwable $e) {
            Log::warning('deleteObjectsByPrefix failed', ['prefix' => $prefix, 'error' => $e->getMessage()]);
        }
    }

}
