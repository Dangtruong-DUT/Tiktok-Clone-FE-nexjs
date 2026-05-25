<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Temporary dev setup: allow all origins/methods/headers.
    | WARNING: do not use this in production.
    |
    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // Reflect any origin (works with credentials)
    'allowed_origins' => [],

    'allowed_origins_patterns' => ['#.*#'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,

];
