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

    /**
     * Run the full HLS encoding pipeline for a given VideoEncoding record.
     *
     * Flow:
     *   1. Mark as PROCESSING
     *   2. Download original from MinIO → temp dir
     *   3. Probe source (duration, dimensions)
     *   4. Encode each applicable HLS variant
     *   5. Generate master.m3u8
     *   6. Extract thumbnail
     *   7. Upload everything to MinIO
     *   8. Mark as READY + upgrade Media.type to HLS_VIDEO
     *
     * On any failure the encoding is marked FAILED and the exception re-thrown
     * so the queue can handle retries.
     */
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

            // Step 1 – download original
            $ext = pathinfo($uploadFile->file_path, PATHINFO_EXTENSION) ?: 'mp4';
            $inputPath = $tempDir.DIRECTORY_SEPARATOR.'input.'.$ext;
            $this->downloadFromStorage($uploadFile->file_path, $inputPath, $uploadFile->disk);

            // Step 2 – probe source
            $videoInfo = $this->ffmpegService->getVideoInfo($inputPath);
            $videoEncoding->update(['duration' => $videoInfo->duration]);

            // Step 3 – determine variants
            $variants = $this->applicableVariants($videoInfo->height);
            throw_if(empty($variants), new \RuntimeException(
                "No applicable HLS variants for source height {$videoInfo->height}px"
            ));

            $variantLabels = array_keys($variants);
            $total = count($variantLabels);
            $segmentDuration = (int) config('video.hls.segment_duration', 6);

            // Step 4 – encode each variant
            foreach ($variantLabels as $i => $label) {
                $this->ffmpegService->encodeVariant($inputPath, $tempDir, $label, $variants[$label], $segmentDuration);

                // Reserve the last 10 % for upload, so progress tops at 90 here
                $progress = (int) ((($i + 1) / ($total + 1)) * 90);
                $videoEncoding->update(['encoding_progress' => $progress]);
                VideoEncodingStatusUpdatedEvent::dispatch($videoEncoding);
            }

            // Step 5 – write master playlist
            $masterContent = $this->buildMasterPlaylist($variantLabels, $variants);
            file_put_contents($tempDir.DIRECTORY_SEPARATOR.'master.m3u8', $masterContent);

            // Step 6 – thumbnail (non-fatal)
            $thumbnailPath = $tempDir.DIRECTORY_SEPARATOR.'thumbnail.jpg';
            $this->ffmpegService->extractThumbnail(
                $inputPath,
                $thumbnailPath,
                min(1.0, $videoInfo->duration * 0.1)
            );

            // Step 7 – upload to MinIO
            $hlsBase = 'videos/'.$uploadFile->uuid;
            $this->uploadHlsDirectory($tempDir, $hlsBase, $variantLabels);

            $thumbnailStoragePath = null;
            if (file_exists($thumbnailPath)) {
                $thumbnailStoragePath = $hlsBase.'/thumbnails/thumbnail.jpg';
                Storage::disk('s3')->put(
                    $thumbnailStoragePath,
                    file_get_contents($thumbnailPath),
                    'public'
                );
            }

            // Step 8 – mark READY
            $videoEncoding->update([
                'status' => VideoEncodingStatusEnum::READY,
                'master_playlist_path' => $hlsBase.'/master.m3u8',
                'encoding_progress' => 100,
                'resolutions' => $variantLabels,
                'metadata' => [
                    'original_width' => $videoInfo->width,
                    'original_height' => $videoInfo->height,
                    'original_bitrate' => $videoInfo->bitrate,
                    'thumbnail_path' => $thumbnailStoragePath,
                ],
                'completed_at' => now(),
            ]);

            // Upgrade all Media records pointing to this file
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

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

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

    /** Return only variants whose height ≤ the source height. */
    private function applicableVariants(int $sourceHeight): array
    {
        return collect(config('video.hls.variants', []))
            ->filter(fn ($v) => $v['height'] <= $sourceHeight)
            ->toArray();
    }

    private function buildMasterPlaylist(array $labels, array $variants): string
    {
        $lines = ['#EXTM3U', '#EXT-X-VERSION:3', ''];

        foreach ($labels as $label) {
            $v = $variants[$label];
            $lines[] = "#EXT-X-STREAM-INF:BANDWIDTH={$v['bandwidth']},RESOLUTION={$v['width']}x{$v['height']},NAME=\"{$label}\"";
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
            ['visibility' => 'public', 'ContentType' => 'application/vnd.apple.mpegurl']
        );

        foreach ($variantLabels as $label) {
            $variantDir = $tempDir.DIRECTORY_SEPARATOR.$label;

            if (! is_dir($variantDir)) {
                continue;
            }

            foreach (glob($variantDir.DIRECTORY_SEPARATOR.'*') as $file) {
                $filename = basename($file);
                $contentType = str_ends_with($filename, '.m3u8')
                    ? 'application/vnd.apple.mpegurl'
                    : 'video/mp2t';

                $disk->put(
                    $storageBase.'/'.$label.'/'.$filename,
                    file_get_contents($file),
                    ['visibility' => 'public', 'ContentType' => $contentType]
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
