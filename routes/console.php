<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    // @phpstan-ignore variable.undefined
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
