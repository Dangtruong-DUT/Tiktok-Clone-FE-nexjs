<?php

namespace App\Services\Video;

use App\Enums\Media\MediaTypeEnum;
use App\Enums\Video\VideoEncodingStatusEnum;
use App\Enums\Video\VideoUploadStatusEnum;
use App\Events\Video\VideoEncodingStatusUpdatedEvent;
use App\Models\Media;
use App\Models\VideoEncoding;
use App\Models\VideoUploadSession;
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
     * Pipeline stages:
     *   1. Download raw file from storage to a local temp directory.
     *   2. Probe video metadata (dimensions, duration, bitrate).
     *   3. Encode each applicable HLS variant with FFmpeg.
     *   4. Build and upload the master playlist + variant segments to storage.
     *   5. Update the encoding record and upload session to READY.
     *
     * @param  VideoEncoding  $videoEncoding  The encoding record to process.
     * @param  int|null       $sessionId      Optional upload session ID to sync status into.
     * @throws \Throwable  Re-throws any exception after marking records as FAILED.
     */
    public function process(VideoEncoding $videoEncoding, ?int $sessionId = null): void
    {
        $uploadFile = $videoEncoding->uploadFile;
        $tempDir    = $this->tempPath($uploadFile->uuid);
        $session    = $sessionId ? VideoUploadSession::find($sessionId) : null;

        try {
            $this->transitionEncoding($videoEncoding, VideoEncodingStatusEnum::PROCESSING, [
                'started_at'        => now(),
                'encoding_progress' => 0,
            ]);
            $this->updateSession($session, VideoUploadStatusEnum::ANALYZING);

            $this->ensureDirectory($tempDir);

            $ext       = pathinfo($uploadFile->file_path, PATHINFO_EXTENSION) ?: 'mp4';
            $inputPath = $tempDir . DIRECTORY_SEPARATOR . 'input.' . $ext;
            $this->downloadFromStorage($uploadFile->file_path, $inputPath, $uploadFile->disk);

            $videoInfo = $this->ffmpegService->getVideoInfo($inputPath);
            $videoEncoding->update(['duration' => $videoInfo->duration]);

            $variants = $this->applicableVariants($videoInfo->width, $videoInfo->height);
            throw_if(empty($variants), new \RuntimeException(
                "No applicable HLS variants for source dimensions {$videoInfo->width}x{$videoInfo->height}"
            ));

            $variantLabels   = array_keys($variants);
            $total           = count($variantLabels);
            $segmentDuration = (int) config('video.hls.segment_duration', 6);

            $this->updateSession($session, VideoUploadStatusEnum::TRANSCODING, [
                'metadata' => [
                    'duration' => $videoInfo->duration,
                    'width'    => $videoInfo->width,
                    'height'   => $videoInfo->height,
                    'bitrate'  => $videoInfo->bitrate,
                ],
            ]);

            foreach ($variantLabels as $i => $label) {
                $this->ffmpegService->encodeVariant(
                    $inputPath, $tempDir, $label, $variants[$label],
                    $segmentDuration, $videoInfo->width, $videoInfo->height
                );

                $progress = (int) ((($i + 1) / ($total + 1)) * 90);
                $videoEncoding->update(['encoding_progress' => $progress]);
                VideoEncodingStatusUpdatedEvent::dispatch($videoEncoding);
            }

            $masterContent = $this->buildMasterPlaylist($variantLabels, $variants, $videoInfo->width, $videoInfo->height);
            file_put_contents($tempDir . DIRECTORY_SEPARATOR . 'master.m3u8', $masterContent);

            $hlsPrefix = rtrim(config('video.hls_storage_prefix', 'hls'), '/');
            $hlsBase   = $hlsPrefix . '/' . $uploadFile->uuid;
            $this->uploadHlsDirectory($tempDir, $hlsBase, $variantLabels, $uploadFile->disk);

            $videoEncoding->update([
                'status'               => VideoEncodingStatusEnum::READY,
                'master_playlist_path' => $hlsBase . '/master.m3u8',
                'encoding_progress'    => 100,
                'resolutions'          => $variantLabels,
                'metadata'             => [
                    'original_width'   => $videoInfo->width,
                    'original_height'  => $videoInfo->height,
                    'original_bitrate' => $videoInfo->bitrate,
                ],
                'completed_at' => now(),
            ]);

            $this->updateSession($session, VideoUploadStatusEnum::READY);

            Media::where('upload_file_id', $uploadFile->id)
                ->update(['type' => MediaTypeEnum::HLS_VIDEO]);

            VideoEncodingStatusUpdatedEvent::dispatch($videoEncoding->fresh());

        } catch (\Throwable $e) {
            Log::error('HLS encoding pipeline failed', [
                'upload_file_id' => $uploadFile->id,
                'error'          => $e->getMessage(),
            ]);

            $videoEncoding->update([
                'status'        => VideoEncodingStatusEnum::FAILED,
                'error_message' => $e->getMessage(),
                'completed_at'  => now(),
            ]);

            $this->updateSession($session, VideoUploadStatusEnum::FAILED);

            VideoEncodingStatusUpdatedEvent::dispatch($videoEncoding->fresh());

            throw $e;
        } finally {
            $this->cleanupDirectory($tempDir);
        }
    }

    /**
     * Update the upload session status and any extra fields.
     * No-ops if no session is provided.
     *
     * @param  VideoUploadSession|null  $session  The session to update, or null.
     * @param  VideoUploadStatusEnum    $status   The new status to apply.
     * @param  array<string, mixed>     $extra    Additional fields to merge into the update.
     */
    private function updateSession(
        ?VideoUploadSession $session,
        VideoUploadStatusEnum $status,
        array $extra = []
    ): void {
        $session?->update(array_merge(['status' => $status], $extra));
    }

    /**
     * Transition a VideoEncoding to a new status and dispatch the status-updated event.
     *
     * @param  VideoEncoding           $encoding  The encoding record.
     * @param  VideoEncodingStatusEnum $status    The new status.
     * @param  array<string, mixed>    $extra     Additional fields to merge.
     */
    private function transitionEncoding(VideoEncoding $encoding, VideoEncodingStatusEnum $status, array $extra = []): void
    {
        $encoding->update(array_merge(['status' => $status], $extra));
        VideoEncodingStatusUpdatedEvent::dispatch($encoding);
    }

    /**
     * Build the absolute path to the temp working directory for a given upload UUID.
     *
     * @param  string  $uuid  Upload file UUID.
     * @return string
     */
    private function tempPath(string $uuid): string
    {
        return rtrim(config('video.temp_directory'), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . $uuid;
    }

    /**
     * Create a directory if it does not already exist.
     *
     * @param  string  $path  Absolute path to create.
     */
    private function ensureDirectory(string $path): void
    {
        if (! is_dir($path)) {
            mkdir($path, 0755, true);
        }
    }

    /**
     * Download a file from the given storage disk to a local path.
     *
     * @param  string  $storagePath  The key/path on the storage disk.
     * @param  string  $localPath    Absolute destination path on the local filesystem.
     * @param  string  $disk         The Filesystem disk name (default: configured default).
     * @throws \RuntimeException  If the storage stream cannot be opened.
     */
    private function downloadFromStorage(string $storagePath, string $localPath, string $disk = ''): void
    {
        $disk   = $disk ?: config('filesystems.default', 's3');
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

    /**
     * Return the HLS variant configurations applicable for the given source dimensions.
     * A variant is applicable if its target size is <= the shorter side of the video.
     *
     * @param  int  $srcWidth   Source video width in pixels.
     * @param  int  $srcHeight  Source video height in pixels.
     * @return array<string, array<string, mixed>>  Filtered variant config map.
     */
    private function applicableVariants(int $srcWidth, int $srcHeight): array
    {
        $shorterSide = min($srcWidth, $srcHeight);

        return collect(config('video.hls.variants', []))
            ->filter(fn ($v) => $v['size'] <= $shorterSide)
            ->toArray();
    }

    /**
     * Build the HLS master playlist content string from variant labels and config.
     *
     * @param  array<int, string>             $labels    Ordered list of variant labels (e.g. ['360p', '720p']).
     * @param  array<string, array<string, mixed>>  $variants  Full variant config map.
     * @param  int                            $srcWidth
     * @param  int                            $srcHeight
     * @return string  The master.m3u8 content.
     */
    private function buildMasterPlaylist(array $labels, array $variants, int $srcWidth, int $srcHeight): string
    {
        $lines = ['#EXTM3U', '#EXT-X-VERSION:3', ''];

        foreach ($labels as $label) {
            $v       = $variants[$label];
            $lines[] = "#EXT-X-STREAM-INF:BANDWIDTH={$v['bandwidth']},RESOLUTION={$srcWidth}x{$srcHeight},NAME=\"{$label}\"";
            $lines[] = "{$label}/index.m3u8";
        }

        return implode("\n", $lines);
    }

    /**
     * Upload the master playlist and all variant segment directories to storage.
     *
     * @param  string              $tempDir       Local temp directory containing encoded files.
     * @param  string              $storageBase   Base storage key for the HLS output (e.g. "hls/{uuid}").
     * @param  array<int, string>  $variantLabels List of encoded variant labels to upload.
     * @param  string              $disk          The Filesystem disk name to upload to.
     */
    private function uploadHlsDirectory(string $tempDir, string $storageBase, array $variantLabels, string $disk = ''): void
    {
        $disk    = $disk ?: config('filesystems.default', 's3');
        $storage = Storage::disk($disk);

        $storage->put(
            $storageBase . '/master.m3u8',
            file_get_contents($tempDir . DIRECTORY_SEPARATOR . 'master.m3u8'),
            [
                'ContentType'  => 'application/vnd.apple.mpegurl',
                'CacheControl' => 'no-cache, no-store, must-revalidate',
            ]
        );

        foreach ($variantLabels as $label) {
            $variantDir = $tempDir . DIRECTORY_SEPARATOR . $label;

            if (! is_dir($variantDir)) {
                continue;
            }

            foreach (glob($variantDir . DIRECTORY_SEPARATOR . '*') as $file) {
                $filename   = basename($file);
                $isPlaylist = str_ends_with($filename, '.m3u8');

                $storage->put(
                    $storageBase . '/' . $label . '/' . $filename,
                    file_get_contents($file),
                    [
                        'ContentType'  => $isPlaylist ? 'application/vnd.apple.mpegurl' : 'video/mp2t',
                        'CacheControl' => $isPlaylist
                            ? 'no-cache, must-revalidate'
                            : 'public, max-age=604800, immutable',
                    ]
                );
            }
        }
    }

    /**
     * Recursively delete a local directory and all of its contents.
     *
     * @param  string  $dir  Absolute path to the directory to remove.
     */
    private function cleanupDirectory(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        foreach (array_diff(scandir($dir), ['.', '..']) as $entry) {
            $path = $dir . DIRECTORY_SEPARATOR . $entry;
            is_dir($path) ? $this->cleanupDirectory($path) : unlink($path);
        }

        rmdir($dir);
    }
}
