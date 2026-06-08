<?php

namespace App\Providers;

use App\Contracts\Upload\UploadFileServiceInterface;
use App\Contracts\Upload\UploadStorageInterface;
use App\Services\Upload\LocalFileUploadService;
use App\Services\Upload\PresignedUploadService;
use App\Services\Upload\SimpleFileUploadService;
use App\Services\Upload\Storage\MultipartUploadService;
use App\Services\Upload\Storage\ObjectStorageService;
use App\Services\Upload\Storage\PresignedUrlService;
use App\Services\Upload\Storage\S3ClientFactory;
use App\Services\Upload\Storage\StorageCleanupService;
use Illuminate\Support\ServiceProvider;

class UploadFileServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UploadFileServiceInterface::class, function () {
            $storageDriver = config('filesystems.default', 'local');

            return match ($storageDriver) {
                's3', 'minio' => new SimpleFileUploadService,
                default       => new LocalFileUploadService,
            };
        });

        $this->app->singleton(UploadStorageInterface::class, function () {
            $diskConfig = (array) config('filesystems.disks.s3');
            $factory    = new S3ClientFactory;

            $apiClient     = $factory->makeApiClient($diskConfig);
            $signingClient = $factory->makeSigningClient($diskConfig);
            $bucket        = (string) $diskConfig['bucket'];

            return new PresignedUploadService(
                presigned: new PresignedUrlService($signingClient, $bucket),
                multipart: new MultipartUploadService($apiClient, $bucket),
                objects:   new ObjectStorageService($apiClient, $bucket),
                cleanup:   new StorageCleanupService($apiClient, $bucket),
            );
        });
    }
}
