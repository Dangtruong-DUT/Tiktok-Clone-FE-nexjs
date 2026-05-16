<?php

namespace App\Listeners\Auth;

use App\Events\Auth\UserPasswordResetRequestedEvent;
use App\Mail\ForgotPasswordEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Mail;

class SendPasswordResetEmailListener implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(UserPasswordResetRequestedEvent $event): void
    {
        Mail::to($event->email)->send(new ForgotPasswordEmail($event->user, $event->resetToken));
    }
}
