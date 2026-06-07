<?php

namespace App\Contracts\AI;

use App\DTOs\AI\Gemini\GeminiRequest;
use App\DTOs\AI\Gemini\GeminiResponse;

interface GeminiClientInterface
{
    /**
     * @phpstan-type GeminiTokenUsage array{
     *     prompt_tokens:int,
     *     completion_tokens:int,
     *     total_tokens:int
     * }
     * @phpstan-type GeminiStreamChunkHandler callable(string, bool, GeminiTokenUsage): void
     */

    /**
     * Non-streaming generation for single-turn or multi-turn requests.
     */
    public function send(GeminiRequest $request): GeminiResponse;

    /**
     * Streaming generation via SSE.
     *
     * Calls $onChunk($delta, false, $tokenUsage) for each text chunk,
     * then $onChunk('', true, $tokenUsage) when the stream ends.
     *
     * @param  GeminiStreamChunkHandler  $onChunk
     */
    public function stream(GeminiRequest $request, callable $onChunk): GeminiResponse;
}
