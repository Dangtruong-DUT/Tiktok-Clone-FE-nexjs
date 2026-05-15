<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class VerifyUserSuccess extends BaseMailAble
{
    /**
     * Create a new message instance.
     */
    public function __construct(
        private User $user,
    ) {
        parent::__construct();
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Account Has Been Verified',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.verify_user_email_success',
            with: [
                'name' => $this->user->name,
                'homeUrl' => config('app.frontend_url'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
