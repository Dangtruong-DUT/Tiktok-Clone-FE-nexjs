<?php

namespace App\Listeners\Admin;

use App\Events\Admin\AdminPositiveActionNotifiedEvent;
use App\Mail\AdminPositiveActionMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendPositiveActionEmailListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(AdminPositiveActionNotifiedEvent $event): void
    {
        if (empty($event->targetUser->email)) {
            return;
        }

        Mail::to($event->targetUser->email)->send(new AdminPositiveActionMail(
            targetUser: $event->targetUser,
            action: $event->action,
            adminMessage: $event->message,
        ));
    }

    public function failed(AdminPositiveActionNotifiedEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to send positive action email', [
            'target_user_id' => $event->targetUser->id,
            'action' => $event->action->value,
            'error' => $exception->getMessage(),
        ]);
    }
}
