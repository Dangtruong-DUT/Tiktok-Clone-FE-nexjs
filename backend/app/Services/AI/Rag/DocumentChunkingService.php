<?php

namespace App\Services\AI\Rag;

class DocumentChunkingService
{
    private int $targetChars;
    private int $overlapChars;

    public function __construct()
    {
        $this->targetChars  = (int) config('ai.rag.chunk_target_chars', 3000);
        $this->overlapChars = (int) config('ai.rag.chunk_overlap_chars', 400);
    }

    /**
     * Split document content into overlapping text chunks.
     * Handles HTML, Markdown, and plain text.
     *
     * @return string[]
     */
    public function chunk(string $content, string $contentType = 'markdown'): array
    {
        $text = match ($contentType) {
            'html'     => $this->htmlToText($content),
            'markdown' => $this->markdownToText($content),
            default    => $content,
        };

        $text = $this->normalizeWhitespace($text);

        return $this->splitWithOverlap($text);
    }

    private function htmlToText(string $html): string
    {
        // Preserve block-level element boundaries as newlines
        $html = preg_replace('/<\/(p|div|li|h[1-6]|tr|blockquote)>/i', "\n", $html);
        $html = preg_replace('/<br\s*\/?>/i', "\n", $html);
        $text = strip_tags($html);
        return html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    private function markdownToText(string $md): string
    {
        // Strip headings markers
        $md = preg_replace('/^#{1,6}\s+/m', '', $md);
        // Strip bold/italic
        $md = preg_replace('/\*{1,3}([^*]+)\*{1,3}/', '$1', $md);
        $md = preg_replace('/_{1,3}([^_]+)_{1,3}/', '$1', $md);
        // Strip inline code
        $md = preg_replace('/`([^`]+)`/', '$1', $md);
        // Strip code blocks
        $md = preg_replace('/```[\s\S]*?```/', '', $md);
        // Strip links — keep link text
        $md = preg_replace('/\[([^\]]+)\]\([^)]+\)/', '$1', $md);
        // Strip images
        $md = preg_replace('/!\[[^\]]*\]\([^)]+\)/', '', $md);
        // Strip horizontal rules
        $md = preg_replace('/^[-*_]{3,}\s*$/m', '', $md);

        return $md;
    }

    private function normalizeWhitespace(string $text): string
    {
        // Collapse multiple blank lines into one
        $text = preg_replace('/\n{3,}/', "\n\n", $text);
        // Collapse multiple spaces
        $text = preg_replace('/ {2,}/', ' ', $text);
        return trim($text);
    }

    /** @return string[] */
    private function splitWithOverlap(string $text): array
    {
        $chunks = [];
        $len    = mb_strlen($text);
        $start  = 0;

        while ($start < $len) {
            $end = $start + $this->targetChars;

            if ($end >= $len) {
                $chunks[] = trim(mb_substr($text, $start));
                break;
            }

            // Try to break at a sentence boundary (. ! ?) or paragraph break near the target
            $slice    = mb_substr($text, $start, $this->targetChars);
            $breakPos = $this->findBreakPoint($slice);

            $chunk    = trim(mb_substr($text, $start, $breakPos));
            if ($chunk !== '') {
                $chunks[] = $chunk;
            }

            $start += max($breakPos - $this->overlapChars, $this->overlapChars);
        }

        return array_values(array_filter($chunks));
    }

    private function findBreakPoint(string $slice): int
    {
        $len = mb_strlen($slice);

        // Search backwards from the end for a paragraph break
        $pos = mb_strrpos($slice, "\n\n");
        if ($pos !== false && $pos > $len * 0.5) {
            return $pos + 2;
        }

        // Fall back to a sentence-ending punctuation
        foreach (['. ', '! ', '? ', ".\n", "!\n", "?\n"] as $delim) {
            $pos = mb_strrpos($slice, $delim);
            if ($pos !== false && $pos > $len * 0.5) {
                return $pos + mb_strlen($delim);
            }
        }

        // Last resort: single newline
        $pos = mb_strrpos($slice, "\n");
        if ($pos !== false && $pos > $len * 0.5) {
            return $pos + 1;
        }

        return $len;
    }

    public function estimateTokens(string $text): int
    {
        // Rough estimate: 1 token ≈ 4 chars (works for Vietnamese + English)
        return (int) ceil(mb_strlen($text) / 4);
    }
}
