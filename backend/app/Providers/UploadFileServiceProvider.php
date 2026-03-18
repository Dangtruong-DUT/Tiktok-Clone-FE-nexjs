<?php

namespace App\Providers;

use App\Libraries\Upload\LocalUploadFileService;
use App\Libraries\Upload\MinioUploadFileService;
use App\Libraries\Upload\UploadFileServiceInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class UploadFileServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register(): void
    {
        $this->app->bind(UploadFileServiceInterface::class, function ($app) {
            $storage_driver = config('filesystems.default', 'local');
            Log::info('Binding UploadFileServiceInterface to implementation', ['storage_driver' => $storage_driver]);
            return match ($storage_driver) {
                's3', 'minio' => new MinioUploadFileService(),
                default => new LocalUploadFileService(),
            };
        });
    }
}
