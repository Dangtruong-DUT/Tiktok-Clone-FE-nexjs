<?php

namespace App\DTOs\AI\Gemini;

final class GeminiResponse
{
    /**
     * @param  array{prompt_tokens: int, completion_tokens: int, total_tokens: int}  $tokenUsage
     */
    public function __construct(
        public readonly string $text,
        public readonly array  $tokenUsage,
    ) {}

    /** @return array{text: string, token_usage: array<string,int>} */
    public function toArray(): array
    {
        return [
            'text'        => $this->text,
            'token_usage' => $this->tokenUsage,
        ];
    }
}
