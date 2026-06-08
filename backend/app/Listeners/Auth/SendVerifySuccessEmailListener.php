<?php

namespace App\Listeners\Auth;

use App\Events\Auth\UserEmailVerifiedEvent;
use App\Mail\VerifyUserSuccess;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendVerifySuccessEmailListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(UserEmailVerifiedEvent $event): void
    {
        Mail::to($event->user->email)->send(new VerifyUserSuccess($event->user));
    }

    public function failed(UserEmailVerifiedEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to send email verification success email', [
            'user_id' => $event->user->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
