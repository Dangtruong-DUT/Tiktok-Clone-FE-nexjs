<?php

use Illuminate\Support\Facades\Schedule;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing access to the command's methods and properties. Build something great!
|
*/

Schedule::command('posts:sync-views')
    ->everyMinute()
    ->withoutOverlapping();

Schedule::command('posts:publish-scheduled')
    ->everyMinute()
    ->withoutOverlapping();

Schedule::command('video:cleanup --days=7')
    ->dailyAt('03:00')
    ->withoutOverlapping();

Schedule::job(new \App\Jobs\CleanupAbandonedUploadsJob())
    ->dailyAt('04:00')
    ->withoutOverlapping();

Schedule::command('model:prune', ['--model' => [\App\Models\AiCopilotSession::class]])
    ->dailyAt('02:30')
    ->withoutOverlapping();
