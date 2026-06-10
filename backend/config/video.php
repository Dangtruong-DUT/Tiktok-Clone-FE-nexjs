<?php

return [
    'ffmpeg_binary'      => env('FFMPEG_BINARY', 'ffmpeg'),
    'ffprobe_binary'     => env('FFPROBE_BINARY', 'ffprobe'),
    'temp_directory'     => storage_path('app/temp/videos'),
    'hls_storage_prefix' => env('VIDEO_HLS_STORAGE_PREFIX', 'hls'),
    'encoding_timeout'   => env('VIDEO_ENCODING_TIMEOUT', 7200), // seconds

    /*
    |--------------------------------------------------------------------------
    | Upload Session Configuration
    |--------------------------------------------------------------------------
    |
    | Controls limits and thresholds for direct-to-storage upload sessions.
    | Files >= multipart_threshold_bytes will use S3 multipart upload.
    |
    */
    'upload' => [
        'max_file_size_bytes'       => env('VIDEO_UPLOAD_MAX_FILE_SIZE', 1024 * 1024 * 1024),  // 1 GB
        'multipart_threshold_bytes' => env('VIDEO_UPLOAD_MULTIPART_THRESHOLD', 50 * 1024 * 1024),  // 50 MB
        'chunk_size_bytes'          => env('VIDEO_UPLOAD_CHUNK_SIZE', 15 * 1024 * 1024),  // 15 MB
        'presigned_ttl_seconds'     => env('VIDEO_UPLOAD_PRESIGNED_TTL', 3600),  // 1 hour
        'session_ttl_hours'         => env('VIDEO_UPLOAD_SESSION_TTL', 24),  // 24 hours
        'allowed_mime_types'        => ['video/mp4', 'video/quicktime', 'video/webm'],
    ],

    'hls' => [
        'segment_duration' => 6,
        'variants' => [
            '360p'  => ['size' => 360,  'video_bitrate' => '800k',  'max_rate' => '856k',  'buf_size' => '1200k',  'audio_bitrate' => '96k',  'bandwidth' => 800000],
            '480p'  => ['size' => 480,  'video_bitrate' => '1400k', 'max_rate' => '1498k', 'buf_size' => '2100k',  'audio_bitrate' => '128k', 'bandwidth' => 1400000],
            '720p'  => ['size' => 720,  'video_bitrate' => '2800k', 'max_rate' => '2996k', 'buf_size' => '4200k',  'audio_bitrate' => '128k', 'bandwidth' => 2800000],
            '1080p' => ['size' => 1080, 'video_bitrate' => '5000k', 'max_rate' => '5350k', 'buf_size' => '7500k',  'audio_bitrate' => '192k', 'bandwidth' => 5000000],
            '1440p' => ['size' => 1440, 'video_bitrate' => '8000k', 'max_rate' => '8560k', 'buf_size' => '12000k', 'audio_bitrate' => '192k', 'bandwidth' => 8000000],
        ],
    ],

];
