<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiUsageLog extends Model
{
    public const UPDATED_AT = null; // append-only

    protected $fillable = [
        'user_id',
        'session_id',
        'message_id',
        'intent',
        'tokens_in',
        'tokens_out',
        'total_tokens',
        'cost_usd',
        'latency_ms',
        'provider',
        'model',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'cost_usd' => 'float',
        ];
    }

    public static function record(
        int $userId,
        array $tokenUsage,
        string $intent,
        string $status = 'success',
        ?int $sessionId = null,
        ?int $messageId = null,
        ?int $latencyMs = null,
        string $provider = 'gemini',
        string $model = '',
    ): self {
        return self::create([
            'user_id'      => $userId,
            'session_id'   => $sessionId,
            'message_id'   => $messageId,
            'intent'       => $intent,
            'tokens_in'    => $tokenUsage['prompt_tokens'] ?? 0,
            'tokens_out'   => $tokenUsage['completion_tokens'] ?? 0,
            'total_tokens' => $tokenUsage['total_tokens'] ?? 0,
            'cost_usd'     => self::estimateCost($tokenUsage, $model),
            'latency_ms'   => $latencyMs,
            'provider'     => $provider,
            'model'        => $model,
            'status'       => $status,
        ]);
    }

    private static function estimateCost(array $tokenUsage, string $model): float
    {
        $totalTokens = $tokenUsage['total_tokens'] ?? 0;

        // Rough estimate: gemini-1.5-flash ~$0.075 per 1M tokens
        $ratePerMillion = str_contains($model, 'pro') ? 0.35 : 0.075;

        return round(($totalTokens / 1_000_000) * $ratePerMillion, 6);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AiCopilotSession::class, 'session_id');
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(AiCopilotMessage::class, 'message_id');
    }
}
