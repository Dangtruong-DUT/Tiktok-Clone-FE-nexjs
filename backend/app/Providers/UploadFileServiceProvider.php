<?php

namespace App\Providers;

use App\Contracts\Upload\UploadStorageInterface;
use App\Libraries\Upload\LocalUploadFileService;
use App\Libraries\Upload\MinioUploadFileService;
use App\Contracts\Upload\UploadFileServiceInterface;
use App\Services\Upload\PresignedUploadService;
use Illuminate\Support\ServiceProvider;

class UploadFileServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UploadFileServiceInterface::class, function () {
            $storage_driver = config('filesystems.default', 'local');

            return match ($storage_driver) {
                's3', 'minio' => new MinioUploadFileService,
                default => new LocalUploadFileService,
            };
        });

        $this->app->bind(UploadStorageInterface::class, PresignedUploadService::class);
    }
}
