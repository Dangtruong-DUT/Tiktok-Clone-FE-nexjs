<?php

namespace App\Libraries\Gemini;

use App\DTOs\AI\Gemini\GeminiConfig;
use Gemini\Data\Content;
use Gemini\Data\GenerationConfig;
use Gemini\Enums\ResponseMimeType;
use Gemini\Enums\Role;

class GeminiRequestBuilder
{
    /**
     * Convert GeminiConfig DTO to Gemini SDK's GenerationConfig.
      * Handles mapping of response MIME type and other generation parameters.
      * @param GeminiConfig $config The configuration DTO containing generation parameters.
      * @return GenerationConfig The SDK-compatible generation configuration object.
     */
    public function generationConfig(GeminiConfig $config): GenerationConfig
    {
        $mimeType = $config->responseMimeType !== null
            ? ResponseMimeType::from($config->responseMimeType)
            : null;

        return new GenerationConfig(
            maxOutputTokens:  $config->maxOutputTokens,
            temperature:      $config->temperature,
            responseMimeType: $mimeType,
        );
    }

    /**
     * Create a system instruction Content object from a plain string prompt.
      * This wraps the system prompt in a Content object with the appropriate role for Gemini interactions.
      * @param string $prompt The system prompt text to be included in the request.
      * @return Content A Content object representing the system instruction for Gemini.
     */
    public function systemInstruction(
        string $prompt
    ): Content {
        return Content::parse(
            part: $prompt,
            role: Role::USER
        );
    }

    /**
     * Split a contents array into [Content[] $history, array $lastRawParts].
     * Last element becomes the current user turn; prior elements become history.
     *
     * @param  array<array{role: string, parts: array}>  $contents
     * @return array{0: Content[], 1: array}
     */
    public function splitContents(array $contents): array
    {
        $last    = array_pop($contents);
        $history = array_values(array_filter(
            array_map(fn (array $item) => $this->toContent($item), $contents)
        ));

        return [$history, $last['parts'] ?? []];
    }

    /**
     * Extract text from an array of parts, concatenating text parts and ignoring non-text parts.
     * This is used to build the user content for the current turn in a chat interaction.
     * @param array<mixed> $parts */
    public function textFromParts(array $parts): string
    {
        return implode('', array_map(
            fn ($part) => is_array($part) ? ($part['text'] ?? '') : '',
            $parts
        ));
    }

    /**
     * Build a Gemini Content object for the user turn from an array of parts.
     * This combines the text from the parts and assigns the USER role, preparing it for inclusion in the Gemini request.
      * @param array<mixed> $parts The raw parts array from the request, which may contain text and inline data.
      * @return Content A Content object representing
    */
    public function userContentFromParts(array $parts): Content
    {
        return Content::from([
            'role'  => Role::USER->value,
            'parts' => $this->normalizeStreamParts($parts),
        ]);
    }

    /**
     * Convert a raw content item from the request into a Gemini Content object.
      * @param array $item The raw content item containing 'role' and 'parts'.
      * @return Content|null A Content object if valid text is present; otherwise null.
     */
    private function toContent(array $item): ?Content
    {
        $parts = $this->normalizeStreamParts($item['parts'] ?? []);

        if ($parts === []) {
            return null;
        }

        $role = Role::tryFrom($item['role']) ?? Role::USER;

        return Content::from([
            'role'  => $role->value,
            'parts' => $parts,
        ]);
    }

    /**
     * Normalize the 'parts' array for streaming requests
     *  by filtering out empty text parts and preserving inlineData parts.
     * @param  array<mixed>  $parts
     * @return array<mixed>
     */
    public function normalizeStreamParts(array $parts): array
    {
        $normalized = [];

        foreach ($parts as $part) {
            if (! is_array($part)) {
                continue;
            }

            if (isset($part['inlineData'])) {
                $normalized[] = ['inlineData' => $part['inlineData']];
                continue;
            }

            if (isset($part['text']) && trim((string) $part['text']) !== '') {
                $normalized[] = ['text' => $part['text']];
            }
        }

        return $normalized;
    }
}
