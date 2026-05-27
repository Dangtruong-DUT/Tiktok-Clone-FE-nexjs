<?php

return [
    'ffmpeg_binary' => env('FFMPEG_BINARY', 'ffmpeg'),
    'ffprobe_binary' => env('FFPROBE_BINARY', 'ffprobe'),
    'temp_directory' => storage_path('app/temp/videos'),
    'encoding_timeout' => env('VIDEO_ENCODING_TIMEOUT', 7200), // seconds

    'hls' => [
        'segment_duration' => 6,
        'variants' => [
            '360p' => [
                'width' => 640, 'height' => 360,
                'video_bitrate' => '800k', 'max_rate' => '856k', 'buf_size' => '1200k',
                'audio_bitrate' => '96k', 'bandwidth' => 800000,
            ],
            '480p' => [
                'width' => 854, 'height' => 480,
                'video_bitrate' => '1400k', 'max_rate' => '1498k', 'buf_size' => '2100k',
                'audio_bitrate' => '128k', 'bandwidth' => 1400000,
            ],
            '720p' => [
                'width' => 1280, 'height' => 720,
                'video_bitrate' => '2800k', 'max_rate' => '2996k', 'buf_size' => '4200k',
                'audio_bitrate' => '128k', 'bandwidth' => 2800000,
            ],
            '1080p' => [
                'width' => 1920, 'height' => 1080,
                'video_bitrate' => '5000k', 'max_rate' => '5350k', 'buf_size' => '7500k',
                'audio_bitrate' => '192k', 'bandwidth' => 5000000,
            ],
            '1440p' => [
                'width' => 2560, 'height' => 1440,
                'video_bitrate' => '8000k', 'max_rate' => '8560k', 'buf_size' => '12000k',
                'audio_bitrate' => '192k', 'bandwidth' => 8000000,
            ],
        ],
    ],

    'thumbnail' => [
        'at_second' => 1.0,
    ],
];
