<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class AdminDirectMessageMail extends BaseMailAble
{
    public function __construct(
        private readonly User $admin,
        private readonly User $targetUser,
        private readonly string $subjectLine,
        private readonly string $messageBody,
    ) {
        parent::__construct();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin_direct_message',
            with: [
                'targetUserName' => $this->targetUser->name ?? $this->targetUser->username,
                'adminName' => $this->admin->name ?? $this->admin->username,
                'subjectLine' => $this->subjectLine,
                'messageBody' => $this->messageBody,
                'appName' => config('app.name'),
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
