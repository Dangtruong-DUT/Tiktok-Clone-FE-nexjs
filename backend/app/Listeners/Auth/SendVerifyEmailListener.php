<?php

namespace App\Listeners\Auth;

use App\Events\Auth\UserEmailVerificationRequestedEvent;
use App\Mail\VerifyUserEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendVerifyEmailListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(UserEmailVerificationRequestedEvent $event): void
    {
        Mail::to($event->email)->send(new VerifyUserEmail($event->user, $event->verifyToken));
    }

    public function failed(UserEmailVerificationRequestedEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to send verification email', [
            'user_id' => $event->user->id,
            'email' => $event->email,
            'error' => $exception->getMessage(),
        ]);
    }
}
