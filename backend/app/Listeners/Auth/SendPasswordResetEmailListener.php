<?php

namespace App\Listeners\Auth;

use App\Events\Auth\UserPasswordResetRequestedEvent;
use App\Mail\ForgotPasswordEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPasswordResetEmailListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(UserPasswordResetRequestedEvent $event): void
    {
        Mail::to($event->email)->send(new ForgotPasswordEmail($event->user, $event->resetToken));
    }

    public function failed(UserPasswordResetRequestedEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to send password reset email', [
            'user_id' => $event->user->id,
            'email' => $event->email,
            'error' => $exception->getMessage(),
        ]);
    }
}
