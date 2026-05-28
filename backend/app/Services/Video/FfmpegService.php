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

        $size = $variant['size'];
        $isPortrait = $srcHeight > $srcWidth;

        // Scale the shorter side to $size, keep aspect ratio, ensure both dims are divisible by 2
        $scaleFilter = $isPortrait
            ? "scale={$size}:-2"   // portrait: fix width, auto height
            : "scale=-2:{$size}";  // landscape/square: fix height, auto width

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
