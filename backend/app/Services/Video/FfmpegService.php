<?php

namespace App\Services\Video;

use App\DTOs\Video\VideoInfoDto;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class FfmpegService
{
    private readonly string $ffmpegBin;
    private readonly string $ffprobeBin;

    public function __construct()
    {
        $this->ffmpegBin = config('video.ffmpeg_binary', 'ffmpeg');
        $this->ffprobeBin = config('video.ffprobe_binary', 'ffprobe');
    }

    /**
     * Probe a video file and return its metadata.
     */
    public function getVideoInfo(string $inputPath): VideoInfoDto
    {
        $process = new Process([
            $this->ffprobeBin,
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_streams',
            '-show_format',
            $inputPath,
        ]);

        $process->setTimeout(60);
        $process->run();

        if (! $process->isSuccessful()) {
            throw new ProcessFailedException($process);
        }

        $info = json_decode($process->getOutput(), true);

        $videoStream = collect($info['streams'] ?? [])
            ->first(fn ($s) => $s['codec_type'] === 'video');

        return new VideoInfoDto(
            duration: (float) ($info['format']['duration'] ?? 0),
            width: (int) ($videoStream['width'] ?? 0),
            height: (int) ($videoStream['height'] ?? 0),
            bitrate: (int) ($info['format']['bit_rate'] ?? 0),
        );
    }

    /**
     * Encode a single HLS variant into $outputDir/$label/.
     *
     * Generates:  $outputDir/$label/index.m3u8
     *             $outputDir/$label/segment_000.ts  ...
     *
     * @param  array  $variant  Entry from config('video.hls.variants')
     */
    public function encodeVariant(
        string $inputPath,
        string $outputDir,
        string $label,
        array $variant,
        int $segmentDuration = 6
    ): void {
        $variantDir = $outputDir.DIRECTORY_SEPARATOR.$label;

        if (! is_dir($variantDir)) {
            mkdir($variantDir, 0755, true);
        }

        $w = $variant['width'];
        $h = $variant['height'];

        // Maintain aspect ratio, pad to exact dimensions with black bars
        $scaleFilter = "scale={$w}:{$h}:force_original_aspect_ratio=decrease,pad={$w}:{$h}:(ow-iw)/2:(oh-ih)/2";

        $process = new Process([
            $this->ffmpegBin,
            '-i', $inputPath,
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-crf', '23',
            '-vf', $scaleFilter,
            '-maxrate', $variant['max_rate'],
            '-bufsize', $variant['buf_size'],
            '-c:a', 'aac',
            '-b:a', $variant['audio_bitrate'],
            '-ar', '44100',
            '-hls_time', (string) $segmentDuration,
            '-hls_playlist_type', 'vod',
            '-hls_segment_filename', $variantDir.DIRECTORY_SEPARATOR.'segment_%03d.ts',
            '-hls_flags', 'independent_segments',
            '-y',
            $variantDir.DIRECTORY_SEPARATOR.'index.m3u8',
        ]);

        $process->setTimeout((int) config('video.encoding_timeout', 7200));
        $process->run();

        if (! $process->isSuccessful()) {
            Log::error('FFmpeg failed for variant '.$label, ['stderr' => $process->getErrorOutput()]);
            throw new ProcessFailedException($process);
        }
    }

    /**
     * Extract a single JPEG frame from a video. Non-fatal — logs on failure.
     */
    public function extractThumbnail(string $inputPath, string $outputPath, float $atSecond = 1.0): void
    {
        $process = new Process([
            $this->ffmpegBin,
            '-ss', (string) max(0, $atSecond),
            '-i', $inputPath,
            '-vframes', '1',
            '-q:v', '2',
            '-y',
            $outputPath,
        ]);

        $process->setTimeout(60);
        $process->run();

        if (! $process->isSuccessful()) {
            Log::warning('FFmpeg thumbnail extraction failed', ['stderr' => $process->getErrorOutput()]);
        }
    }
}
