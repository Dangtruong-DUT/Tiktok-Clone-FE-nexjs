<?php

namespace App\Listeners\Admin;

use App\Events\Admin\AdminDirectMessageSentEvent;
use App\Mail\AdminDirectMessageEmail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Mail;

class SendDirectMessageEmailListener implements ShouldQueue
{
    use Queueable;

    public function __construct()
    {
        $this->onQueue('emails');
        $this->afterCommit = true;
    }

    public function handle(AdminDirectMessageSentEvent $event): void
    {
        $email = $event->targetUser->email;
        if (empty($email)) {
            return;
        }

        Mail::to($email)->send(new AdminDirectMessageEmail(
            admin: $event->admin,
            targetUser: $event->targetUser,
            subjectLine: $event->subject,
            messageBody: $event->message,
        ));
    }
}
