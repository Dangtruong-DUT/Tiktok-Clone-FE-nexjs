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

// Schedule the post view sync command to run every minute
Schedule::command('posts:sync-views')
    ->everyMinute()
    ->withoutOverlapping();
