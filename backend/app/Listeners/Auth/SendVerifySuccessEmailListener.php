<?php

namespace App\Listeners\Auth;

use App\Events\Auth\UserEmailVerifiedEvent;
use App\Mail\VerifyUserSuccessEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Mail;

class SendVerifySuccessEmailListener implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(UserEmailVerifiedEvent $event): void
    {
        Mail::to($event->user->email)->send(new VerifyUserSuccessEmail($event->user));
    }
}
