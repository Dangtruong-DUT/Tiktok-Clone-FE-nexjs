<?php

namespace App\Mail;

use App\Enums\Admin\AdminActionEnum;
use App\Models\User;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class AdminModerationActionMail extends BaseMailAble
{
    /**
     * Admin identity is intentionally hidden from the email.
     */
    public function __construct(
        private readonly User $targetUser,
        private readonly AdminActionEnum $action,
        private readonly string $reason,
        private readonly string $appealLink,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Moderation Notice: ' . $this->action->label(),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin_moderation_action',
            with: [
                'targetUserName' => $this->targetUser->name ?? $this->targetUser->username,
                'actionLabel' => $this->action->label(),
                'reason' => $this->reason,
                'appealLink' => $this->appealLink,
            ],
        );
    }

    /**
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
