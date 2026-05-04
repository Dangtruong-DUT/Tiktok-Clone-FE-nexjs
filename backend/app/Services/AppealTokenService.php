<?php

namespace App\Services;

use App\Exceptions\http\NotFoundException;
use App\Mail\GuestAppealTokenMail;
use App\Models\AppealToken;
use App\Repositories\AppealTokenRepository;
use App\Traits\HasAuthUser;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AppealTokenService
{
    use HasAuthUser;

    public function __construct(
        private readonly AppealTokenRepository $appealTokenRepository,
        private readonly AppealOwnershipService $appealOwnershipService,
    ) {}

    /**
     * Create a new appeal token and send it to the user's email.
      * @param array $data The data containing email, appeal_type, resource_id, and resource_type
      * @return string
      */
    public function create(array $data): string
    {
        $tokenLength = (int) config('const.appeal_token.length', 60);
        $token = AppealToken::generateToken(length: $tokenLength);

        $this->appealTokenRepository->create([
            'token_hash' =>AppealToken::hashToken($token),
            'email' => $data['email'],
            'appeal_type' => $data['appeal_type'],
            'resource_id' => $data['resource_id'],
            'resource_type' => $data['resource_type'],
            'expires_at' => now()->addDays((int) config('const.appeal_token.ttl_days', 7)),
        ]);

        // Send the token to the user's email
        Mail::to($data['email'])->queue(new GuestAppealTokenMail($token));
    }

    /**
     * Verify an appeal token.
     * @param string $token The token to verify
     * @return AppealToken The verified appeal token instance
     * @throws NotFoundException if the token is not found or expired
     */
    public function verify(string $token): AppealToken
    {
        $appealToken = $this->appealTokenRepository->findValidToken($token);

        if (! $appealToken) {
            throw new NotFoundException('Invalid or expired token.');
        }

        return $appealToken;
    }
}