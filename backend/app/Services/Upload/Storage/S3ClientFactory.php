<?php

namespace App\Services\Upload\Storage;

use Aws\S3\S3Client;

/**
 * Builds AWS S3 clients from a filesystems disk config array.
 *
 * Two separate clients are required when running MinIO behind Docker:
 * - API client  : uses the Docker-internal endpoint so server-side calls resolve inside the network.
 * - Signing client: uses the public-facing URL so the Host embedded in presigned URL signatures
 *   matches what the browser actually sends. Without this, a signature computed for "minio:9000"
 *   fails with 403 SignatureDoesNotMatch when the browser hits "localhost:9000".
 */
class S3ClientFactory
{
    /**
     * Create an S3 client for server-side API calls (createMultipartUpload, headObject, deleteObject, etc.).
     * Uses the Docker-internal endpoint when available.
     *
     * @param  array<string, mixed>  $diskConfig
     */
    public function makeApiClient(array $diskConfig): S3Client
    {
        $config = $this->baseConfig($diskConfig);

        if (! empty($diskConfig['endpoint'])) {
            $config['endpoint'] = $diskConfig['endpoint'];
        }

        return new S3Client($config);
    }

    /**
     * Create an S3 client used only for signing presigned URLs.
     * Must use the public-facing URL (config key: 'url') so the Host in the signature
     * matches the endpoint the browser will actually contact.
     *
     * @param  array<string, mixed>  $diskConfig
     */
    public function makeSigningClient(array $diskConfig): S3Client
    {
        $config = $this->baseConfig($diskConfig);

        $configuredPublicEndpoint = rtrim((string) ($diskConfig['url'] ?? $diskConfig['endpoint'] ?? ''), '/');
        $configuredBucketName     = rtrim((string) ($diskConfig['bucket'] ?? ''), '/');

        if ($configuredPublicEndpoint !== '') {
            $config['endpoint'] = $this->normalizePublicEndpoint(
                publicEndpoint: $configuredPublicEndpoint,
                bucketName: $configuredBucketName,
            );
        }

        return new S3Client($config);
    }

    /**
     * Build the shared base config (credentials, region, path-style) from a disk config array.
     *
     * @param  array<string, mixed>  $diskConfig
     * @return array<string, mixed>
     */
    private function baseConfig(array $diskConfig): array
    {
        $config = [
            'version'     => 'latest',
            'region'      => $diskConfig['region'] ?? 'us-east-1',
            'credentials' => [
                'key'    => $diskConfig['key'],
                'secret' => $diskConfig['secret'],
            ],
        ];

        if (! empty($diskConfig['use_path_style_endpoint'])) {
            $config['use_path_style_endpoint'] = (bool) $diskConfig['use_path_style_endpoint'];
        }

        return $config;
    }

    /**
     * Normalize the public endpoint used for signing so it does not already contain the bucket name.
     * Laravel's S3 disk URL may already include "/{bucket}", but the AWS SDK adds the bucket again
     * when path-style addressing is enabled. Stripping the suffix keeps presigned multipart URLs valid.
     */
    private function normalizePublicEndpoint(string $publicEndpoint, string $bucketName): string
    {
        if ($bucketName === '') {
            return $publicEndpoint;
        }

        $bucketSuffix = '/' . ltrim($bucketName, '/');

        if (! str_ends_with($publicEndpoint, $bucketSuffix)) {
            return $publicEndpoint;
        }

        return rtrim(substr($publicEndpoint, 0, -strlen($bucketSuffix)), '/');
    }
}
