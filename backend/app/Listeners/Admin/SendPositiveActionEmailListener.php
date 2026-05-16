<?php

namespace App\Listeners\Admin;

use App\Events\Admin\AdminPositiveActionNotifiedEvent;
use App\Mail\AdminPositiveActionEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Mail;

class SendPositiveActionEmailListener implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(AdminPositiveActionNotifiedEvent $event): void
    {
        $email = $event->targetUser->email;
        if (empty($email)) {
            return;
        }

        Mail::to($email)->send(new AdminPositiveActionEmail(
            targetUser: $event->targetUser,
            action: $event->action,
            adminMessage: $event->message,
        ));
    }
}
