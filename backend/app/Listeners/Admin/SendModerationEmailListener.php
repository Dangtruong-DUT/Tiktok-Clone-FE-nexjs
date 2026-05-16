<?php

namespace App\Listeners\Admin;

use App\Events\Admin\AdminModerationActionNotifiedEvent;
use App\Mail\AdminModerationActionEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Mail;

class SendModerationEmailListener implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(AdminModerationActionNotifiedEvent $event): void
    {
        $email = $event->targetUser->email;
        if (empty($email)) {
            return;
        }

        Mail::to($email)->send(new AdminModerationActionEmail(
            targetUser: $event->targetUser,
            action: $event->action,
            reason: $event->reason,
            appealLink: $event->appealLink,
        ));
    }
}
