<?php

return [
    /**
     * --------------------------------------------------------------------------
     * File upload configuration
     * --------------------------------------------------------------------------
     * This configuration is used for validating file uploads, such as images and videos.
     * It defines the maximum file size (in kilobytes) and allowed MIME types for each file type.
     */
    'file' => [
        'image' => [
            'max_size_kb' => 10240, // 10MB
            'mimes' => 'jpg,jpeg,png',
        ],
        'video' => [
            'max_size_kb' => 51200, // 50MB
            'mimes' => 'mp4,mov',
        ],
    ],
    /**
     * --------------------------------------------------------------------------
     * Pagination configuration
     * --------------------------------------------------------------------------
     * This configuration is used for paginating results in API responses.
     * It defines the default number of items per page, the maximum number of items per page, and the default page number.
     */
    'pagination' => [
        'default_per_page' => 10,
        'max_per_page' => 100,
        'default_page' => 1,
        'min_per_page' => 1,
        'min_page' => 1,
    ],

    'appeal_token' => [
        'length' => 60,
        'ttl_days' => 7,
    ],
];