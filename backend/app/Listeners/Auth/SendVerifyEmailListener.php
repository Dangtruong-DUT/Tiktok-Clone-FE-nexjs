<?php

namespace App\Listeners\Auth;

use App\Events\Auth\UserEmailVerificationRequestedEvent;
use App\Mail\VerifyUserEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Mail;

class SendVerifyEmailListener implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(UserEmailVerificationRequestedEvent $event): void
    {
        Mail::to($event->email)->send(new VerifyUserEmail($event->user, $event->verifyToken));
    }
}
