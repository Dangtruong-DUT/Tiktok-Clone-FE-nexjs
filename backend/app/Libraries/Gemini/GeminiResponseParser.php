<?php

namespace App\Libraries\Gemini;

use Gemini\Data\UsageMetadata;
use Gemini\Responses\GenerativeModel\GenerateContentResponse;
use Illuminate\Support\Facades\Log;

class GeminiResponseParser
{
    private const EMPTY_RESPONSE_MESSAGE =
        'No response generated, please try again.';

    /**
     * Extract visible text from Gemini response.
     */
    public function text(
        GenerateContentResponse $response
    ): string {
        $text = '';

        foreach (
            $response->candidates[0]->content?->parts ?? []
            as $part
        ) {
            if ($part->thought ?? false) {
                continue;
            }

            $text .= $part->text ?? '';
        }
        if (config('ai.logging.log_raw_response', false)) {
            Log::channel(config('ai.logging.channel', 'stack'))
                ->debug('[Gemini] raw response', ['preview' => mb_substr($text, 0, 500)]);
        }

        return $text !== ''
            ? $text
            : self::EMPTY_RESPONSE_MESSAGE;
    }

    /**
     * Extract token usage information from Gemini response metadata.
     *
     * @return array{
     *     prompt_tokens:int,
     *     completion_tokens:int,
     *     total_tokens:int
     * }
     */
    public function usage(
        ?UsageMetadata $meta
    ): array {
        return $this->buildUsageArray(
            promptTokens: (int) ($meta?->promptTokenCount ?? 0),
            completionTokens: (int) ($meta?->candidatesTokenCount ?? 0),
            totalTokens: (int) ($meta?->totalTokenCount ?? 0),
        );
    }

    /**
     * Extract visible text delta from a Gemini streaming chunk.
     * Skips any parts marked as 'thought'.
     * @return string The concatenated text delta from the chunk.
     */
    public function streamDelta(
        GenerateContentResponse $response
    ): string {
        $delta = '';

        foreach ($response->candidates[0]->content?->parts ?? [] as $part) {
            if ($part->thought ?? false) {
                continue;
            }

            $delta .= $part->text ?? '';
        }

        return $delta;
    }

    /**
     * Helper method to build a consistent usage array structure.
     * @return array{
     *     prompt_tokens:int,
     *     completion_tokens:int,
     *     total_tokens:int
     * }
     */
    private function buildUsageArray(
        int $promptTokens = 0,
        int $completionTokens = 0,
        int $totalTokens = 0,
    ): array {
        return [
            'prompt_tokens'     => $promptTokens,
            'completion_tokens' => $completionTokens,
            'total_tokens'      => $totalTokens,
        ];
    }
}
