<?php

namespace App\DTOs\AI\Gemini;

final class GeminiRequest
{
    /**
     * @param  array<array{role: string, parts: array}>  $contents  Last element is the current user turn.
     */
    public function __construct(
        public readonly string       $systemPrompt,
        public readonly array        $contents,
        public readonly GeminiConfig $config,
    ) {}
}
