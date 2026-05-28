<?php

namespace App\Services\Video;

use App\Enums\Media\MediaTypeEnum;
use App\Enums\Video\VideoEncodingStatusEnum;
use App\Events\Video\VideoEncodingStatusUpdatedEvent;
use App\Models\Media;
use App\Models\VideoEncoding;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class VideoProcessingService
{
    public function __construct(
        private readonly FfmpegService $ffmpegService,
    ) {}

    public function process(VideoEncoding $videoEncoding): void
    {
        $uploadFile = $videoEncoding->uploadFile;
        $tempDir = $this->tempPath($uploadFile->uuid);

        try {
            $this->transition($videoEncoding, VideoEncodingStatusEnum::PROCESSING, [
                'started_at' => now(),
                'encoding_progress' => 0,
            ]);

            $this->ensureDirectory($tempDir);

            $ext = pathinfo($uploadFile->file_path, PATHINFO_EXTENSION) ?: 'mp4';
            $inputPath = $tempDir.DIRECTORY_SEPARATOR.'input.'.$ext;
            $this->downloadFromStorage($uploadFile->file_path, $inputPath, $uploadFile->disk);

            $videoInfo = $this->ffmpegService->getVideoInfo($inputPath);
            $videoEncoding->update(['duration' => $videoInfo->duration]);

            $variants = $this->applicableVariants($videoInfo->width, $videoInfo->height);
            throw_if(empty($variants), new \RuntimeException(
                "No applicable HLS variants for source dimensions {$videoInfo->width}x{$videoInfo->height}"
            ));

            $variantLabels = array_keys($variants);
            $total = count($variantLabels);
            $segmentDuration = (int) config('video.hls.segment_duration', 6);

            foreach ($variantLabels as $i => $label) {
                $this->ffmpegService->encodeVariant($inputPath, $tempDir, $label, $variants[$label], $segmentDuration, $videoInfo->width, $videoInfo->height);

                $progress = (int) ((($i + 1) / ($total + 1)) * 90);
                $videoEncoding->update(['encoding_progress' => $progress]);
                VideoEncodingStatusUpdatedEvent::dispatch($videoEncoding);
            }

            $masterContent = $this->buildMasterPlaylist($variantLabels, $variants, $videoInfo->width, $videoInfo->height);
            file_put_contents($tempDir.DIRECTORY_SEPARATOR.'master.m3u8', $masterContent);

            $hlsPrefix = rtrim(config('video.hls_storage_prefix', 'hls'), '/');
            $hlsBase = $hlsPrefix.'/'.$uploadFile->uuid;
            $this->uploadHlsDirectory($tempDir, $hlsBase, $variantLabels);

            $videoEncoding->update([
                'status' => VideoEncodingStatusEnum::READY,
                'master_playlist_path' => $hlsBase.'/master.m3u8',
                'encoding_progress' => 100,
                'resolutions' => $variantLabels,
                'metadata' => [
                    'original_width' => $videoInfo->width,
                    'original_height' => $videoInfo->height,
                    'original_bitrate' => $videoInfo->bitrate,
                ],
                'completed_at' => now(),
            ]);

            Media::where('upload_file_id', $uploadFile->id)
                ->update(['type' => MediaTypeEnum::HLS_VIDEO]);

            VideoEncodingStatusUpdatedEvent::dispatch($videoEncoding->fresh());

        } catch (\Throwable $e) {
            Log::error('HLS encoding pipeline failed', [
                'upload_file_id' => $uploadFile->id,
                'error' => $e->getMessage(),
            ]);

            $videoEncoding->update([
                'status' => VideoEncodingStatusEnum::FAILED,
                'error_message' => $e->getMessage(),
                'completed_at' => now(),
            ]);

            VideoEncodingStatusUpdatedEvent::dispatch($videoEncoding->fresh());

            throw $e;
        } finally {
            $this->cleanupDirectory($tempDir);
        }
    }

    private function tempPath(string $uuid): string
    {
        return rtrim(config('video.temp_directory'), DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.$uuid;
    }

    private function ensureDirectory(string $path): void
    {
        if (! is_dir($path)) {
            mkdir($path, 0755, true);
        }
    }

    private function downloadFromStorage(string $storagePath, string $localPath, string $disk = 's3'): void
    {
        $stream = Storage::disk($disk)->readStream($storagePath);

        if (! $stream) {
            throw new \RuntimeException("Cannot read from storage: {$storagePath}");
        }

        $dest = fopen($localPath, 'wb');
        stream_copy_to_stream($stream, $dest);
        fclose($dest);

        if (is_resource($stream)) {
            fclose($stream);
        }
    }

    private function applicableVariants(int $srcWidth, int $srcHeight): array
    {
        $shorterSide = min($srcWidth, $srcHeight);

        return collect(config('video.hls.variants', []))
            ->filter(fn ($v) => $v['size'] <= $shorterSide)
            ->toArray();
    }

    private function buildMasterPlaylist(array $labels, array $variants, int $srcWidth, int $srcHeight): string
    {
        $lines = ['#EXTM3U', '#EXT-X-VERSION:3', ''];

        foreach ($labels as $label) {
            $v = $variants[$label];
            $lines[] = "#EXT-X-STREAM-INF:BANDWIDTH={$v['bandwidth']},RESOLUTION={$srcWidth}x{$srcHeight},NAME=\"{$label}\"";
            $lines[] = "{$label}/index.m3u8";
        }

        return implode("\n", $lines);
    }

    private function uploadHlsDirectory(string $tempDir, string $storageBase, array $variantLabels): void
    {
        $disk = Storage::disk('s3');

        $disk->put(
            $storageBase.'/master.m3u8',
            file_get_contents($tempDir.DIRECTORY_SEPARATOR.'master.m3u8'),
            [
                'visibility' => 'public',
                'ContentType' => 'application/vnd.apple.mpegurl',
                'CacheControl' => 'no-cache, no-store, must-revalidate',
            ]
        );

        foreach ($variantLabels as $label) {
            $variantDir = $tempDir.DIRECTORY_SEPARATOR.$label;

            if (! is_dir($variantDir)) {
                continue;
            }

            foreach (glob($variantDir.DIRECTORY_SEPARATOR.'*') as $file) {
                $filename = basename($file);
                $isPlaylist = str_ends_with($filename, '.m3u8');

                $disk->put(
                    $storageBase.'/'.$label.'/'.$filename,
                    file_get_contents($file),
                    [
                        'visibility' => 'public',
                        'ContentType' => $isPlaylist ? 'application/vnd.apple.mpegurl' : 'video/mp2t',
                        'CacheControl' => $isPlaylist
                            ? 'no-cache, must-revalidate'
                            : 'public, max-age=604800, immutable',
                    ]
                );
            }
        }
    }

    private function transition(VideoEncoding $encoding, VideoEncodingStatusEnum $status, array $extra = []): void
    {
        $encoding->update(array_merge(['status' => $status], $extra));
        VideoEncodingStatusUpdatedEvent::dispatch($encoding);
    }

    private function cleanupDirectory(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        foreach (array_diff(scandir($dir), ['.', '..']) as $entry) {
            $path = $dir.DIRECTORY_SEPARATOR.$entry;
            is_dir($path) ? $this->cleanupDirectory($path) : unlink($path);
        }

        rmdir($dir);
    }
}
