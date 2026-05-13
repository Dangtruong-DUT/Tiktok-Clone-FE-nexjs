<?php

namespace App\Mail;

use App\Enums\Admin\AdminActionEnum;
use App\Models\User;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/**
 * Mail for positive/restorative admin actions:
 * unban, restore account, restore post/comment, approve appeal.
 */
class AdminPositiveActionMail extends BaseMailAble
{
    public function __construct(
        private readonly User $targetUser,
        private readonly AdminActionEnum $action,
        private readonly string $adminMessage,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Account Notice: '.$this->action->label(),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin_positive_action',
            with: [
                'targetUserName' => $this->targetUser->name ?? $this->targetUser->username,
                'actionLabel' => $this->action->label(),
                'adminMessage' => $this->adminMessage,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
