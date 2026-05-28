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
     * Get video information using ffprobe.
     *
     * @param string $inputPath The path to the input video file.
     * @return VideoInfoDto An object containing video information such as duration, dimensions, and bitrate.
     *
     * @throws \Symfony\Component\Process\Exception\ProcessFailedException If the ffprobe process fails.
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

        $width = (int) ($videoStream['width'] ?? 0);
        $height = (int) ($videoStream['height'] ?? 0);

        // Phone videos often store landscape frames with a rotate tag (90/270°).
        // Swap dimensions so the rest of the pipeline sees the display orientation.
        $rotate = (int) ($videoStream['tags']['rotate'] ?? 0);
        if (in_array(abs($rotate), [90, 270])) {
            [$width, $height] = [$height, $width];
        }

        return new VideoInfoDto(
            duration: (float) ($info['format']['duration'] ?? 0),
            width: $width,
            height: $height,
            bitrate: (int) ($info['format']['bit_rate'] ?? 0),
        );
    }

    /**
     * Encode a video to HLS format for a specific variant.
     *
     * @param string $inputPath The path to the input video file.
     * @param string $outputDir The directory where the output HLS files should be saved.
     * @param string $label A label for the variant (e.g., "720p").
     * @param array $variant An array of encoding settings for the variant, including:
     *                       - 'max_rate': The maximum video bitrate (e.g., "3000k").
     *                       - 'buf_size': The buffer size for rate control (e.g., "6000k").
     *                       - 'audio_bitrate': The audio bitrate (e.g., "128k").
     * @param int $segmentDuration The duration of each HLS segment in seconds (default: 6).
     * @param int $srcWidth The source video width for scaling (optional).
     * @param int $srcHeight The source video height for scaling (optional).
     *
     * @throws \Symfony\Component\Process\Exception\ProcessFailedException If the ffmpeg process fails.
     */
    public function encodeVariant(
        string $inputPath,
        string $outputDir,
        string $label,
        array $variant,
        int $segmentDuration = 6,
        int $srcWidth = 0,
        int $srcHeight = 0,
    ): void {
        $variantDir = $outputDir.DIRECTORY_SEPARATOR.$label;

        if (! is_dir($variantDir)) {
            mkdir($variantDir, 0755, true);
        }

        // Normalize rotation without resizing: srcWidth/srcHeight are rotation-corrected
        // from getVideoInfo(), so this forces ffmpeg to apply any rotate metadata and
        // output at the original display resolution.
        // Falls back to iw:ih (identity scale) if caller didn't provide dimensions.
        $scaleFilter = ($srcWidth > 0 && $srcHeight > 0)
            ? "scale={$srcWidth}:{$srcHeight}"
            : 'scale=iw:ih';

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

}