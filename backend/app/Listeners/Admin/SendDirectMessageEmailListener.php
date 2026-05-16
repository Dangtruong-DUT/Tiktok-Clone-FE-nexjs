<?php

namespace App\Listeners\Admin;

use App\Events\Admin\AdminDirectMessageSentEvent;
use App\Mail\AdminDirectMessageEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendDirectMessageEmailListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(AdminDirectMessageSentEvent $event): void
    {
        if (empty($event->targetUser->email)) {
            return;
        }

        Mail::to($event->targetUser->email)->send(new AdminDirectMessageEmail(
            admin: $event->admin,
            targetUser: $event->targetUser,
            subjectLine: $event->subject,
            messageBody: $event->message,
        ));
    }

    public function failed(AdminDirectMessageSentEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to send admin direct message email', [
            'admin_id' => $event->admin->id,
            'target_user_id' => $event->targetUser->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
