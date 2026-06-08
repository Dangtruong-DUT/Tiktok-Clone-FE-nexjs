<?php

return [
    'username_validation' => '/^(?!.*\.\.)(?!.*__)[a-zA-Z0-9._]{3,20}$/',
    'social' => [
        'mention_token' => '/(?<![\p{L}\p{N}._])@([a-zA-Z0-9._]{3,20})/u',
        'hashtag_token' => '/(?<![\p{L}\p{N}_])#([\p{L}\p{N}_]{1,100})/u',
    ],
];
