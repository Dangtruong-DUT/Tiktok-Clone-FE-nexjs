<?php

namespace App\Listeners\Admin;

use App\Events\Admin\AdminModerationActionNotifiedEvent;
use App\Mail\AdminModerationActionMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendModerationEmailListener implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public array $backoff = [30, 60, 120];

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(AdminModerationActionNotifiedEvent $event): void
    {
        if (empty($event->targetUser->email)) {
            return;
        }

        Mail::to($event->targetUser->email)->send(new AdminModerationActionMail(
            targetUser: $event->targetUser,
            action: $event->action,
            reason: $event->reason,
            appealLink: $event->appealLink,
        ));
    }

    public function failed(AdminModerationActionNotifiedEvent $event, \Throwable $exception): void
    {
        Log::error('Failed to send moderation action email', [
            'target_user_id' => $event->targetUser->id,
            'action' => $event->action->value,
            'error' => $exception->getMessage(),
        ]);
    }
}
