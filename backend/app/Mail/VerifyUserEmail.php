<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class VerifyUserEmail extends BaseMailAble
{
    /**
     * Create a new message instance.
 */
    public function __construct(
        private User $user,
        private string $token,
    ) {
        parent::__construct();
    }

    /**
     * Get the message envelope.
 */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify User Email',
        );
    }

    /**
     * Get the message content definition.
 */
    public function content(): Content
    {
        return new Content(
            view: 'emails.verify_user_email',
            with: [
                'name' => $this->user->name,
                'verifyUrl' => config('app.frontend_url')
                    .'/en/verify-email?token='.urlencode($this->token)
                    .'&email='.urlencode($this->user->email),
                'expiration' => config('auth.verification.expire'),
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
