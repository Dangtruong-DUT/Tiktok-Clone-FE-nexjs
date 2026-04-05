<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Support\Facades\Log;
use Throwable;

class ForgotPasswordMail extends BaseMailAble
{
    /**
     * Create a new message instance.
     */
    public function __construct(private User $user, private string $token)
    {
        parent::__construct();
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Forgot Password',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.forgot_password',
            with: [
                'name' => $this->user->name,
                'resetUrl' => config('app.frontend_url')
                . '/en/reset-password?token=' . urlencode($this->token)
                . '&email=' . urlencode($this->user->email),
                'expiration' => config('auth.reset_password.expire'),
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

    public function failed(Throwable $exception): void
    {
        Log::error('Failed to send forgot password email: ' . $exception->getMessage());
    }
}
