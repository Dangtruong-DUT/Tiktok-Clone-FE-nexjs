<?php

namespace App\Services\AI\Rag;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\Gemini\GeminiConfig;
use App\DTOs\AI\Gemini\GeminiRequest;
use App\Repositories\AiStudioSettingRepository;
use Illuminate\Support\Collection;

class RagService
{
    /**
     * @param  GeminiEmbeddingService  $embeddingService
     * @param  PgVectorSearchService   $searchService
     * @param  GeminiClientInterface   $geminiClient
     */
    public function __construct(
        private readonly GeminiEmbeddingService $embeddingService,
        private readonly PgVectorSearchService  $searchService,
        private readonly GeminiClientInterface  $geminiClient,
        private readonly AiStudioSettingRepository $settingRepository,
    ) {}

    /**
     * Answer a question using RAG: embed → search → augment → generate.
     * Use answerWithChunks() when the caller already has search results to avoid double embedding.
     *
     * @param  string  $question
     * @param  array<array{role: string, parts: array}>  $history  Gemini native format
     * @param  string  $locale
     * @return array{answer: string, citations: array<int,array<string,mixed>>, has_docs: bool}
     */
    public function answer(string $question, array $history = [], string $locale = 'vi'): array
    {
        $embedding = $this->embeddingService->embed($question, 'RETRIEVAL_QUERY');
        $chunks    = $this->searchService->search($embedding, limit: 5, threshold: 0.70);

        return $this->answerWithChunks($question, $chunks, $history, $locale);
    }

    /**
     * Generate an answer from pre-fetched chunks — skips the embed+search step.
     * Call this when the caller (e.g. AppKnowledgeEngine) already performed the vector search.
     *
     * @param  string      $question
     * @param  Collection  $chunks    Result from PgVectorSearchService::search()
     * @param  array<array{role: string, parts: array}>  $history  Gemini native format
     * @param  string      $locale
     * @param  callable(string $chunk, bool $done): void|null  $emit  SSE streaming callback
     * @return array{answer: string, citations: array<int,array<string,mixed>>, has_docs: bool}
     */
    public function answerWithChunks(
        string     $question,
        Collection $chunks,
        array      $history  = [],
        string     $locale   = 'vi',
        ?callable  $emit     = null,
    ): array {
        $context   = $this->buildContext($chunks);
        $answer    = $this->generate($question, $context, $history, $locale, $emit);
        $citations = $this->buildCitations($chunks);

        return [
            'answer'    => $answer,
            'citations' => $citations,
            'has_docs'  => $chunks->isNotEmpty(),
        ];
    }

    private function buildContext(Collection $chunks): string
    {
        if ($chunks->isEmpty()) {
            return '';
        }

        return $chunks->map(fn ($chunk, $i) =>
            '--- Nguồn ' . ($i + 1) . ": {$chunk->document_title} ---\n{$chunk->content}"
        )->implode("\n\n");
    }

    private function generate(
        string    $question,
        string    $context,
        array     $history,
        string    $locale,
        ?callable $emit = null,
    ): string {
        $isVi = str_starts_with($locale, 'vi');

        $systemPrompt = $isVi
            ? "Bạn là Snapi AI — trợ lý thông minh của nền tảng Snapi Studio. "
              . "Hãy trả lời chính xác và ngắn gọn bằng tiếng Việt dựa trên tài liệu được cung cấp. "
              . "Nếu không tìm thấy thông tin trong tài liệu, hãy nói thật thà và không bịa đặt.\n\n"
              . ($context !== '' ? "## Tài liệu tham khảo\n{$context}" : '')
            : "You are Snapi AI — a helpful assistant for the Snapi Studio platform. "
              . "Answer accurately and concisely in English based on the provided documents. "
              . "If the information is not in the documents, say so honestly.\n\n"
              . ($context !== '' ? "## Reference Documents\n{$context}" : '');

        // $history is already in Gemini native format {role: 'model'|'user', parts: [{text}]}
        $contents   = $history;
        $contents[] = ['role' => 'user', 'parts' => [['text' => $question]]];

        $answer = '';

        $this->geminiClient->stream(
            new GeminiRequest(
                systemPrompt: $systemPrompt,
                contents:     $contents,
                config:       GeminiConfig::fromSetting($this->settingRepository->current()),
            ),
            function (string $delta, bool $done, array $tokenUsage) use (&$answer, $emit) {
                if (! $done) {
                    $answer .= $delta;
                    if ($emit !== null) {
                        $emit($delta, false);
                    }
                }
            },
        );

        return $answer;
    }

    private function buildCitations(Collection $chunks): array
    {
        return $chunks->map(fn ($chunk) => [
            'document_title' => $chunk->document_title,
            'source_type'    => $chunk->document_source_type,
            'source_url'     => $chunk->document_source_url,
            'snippet'        => mb_strimwidth($chunk->content, 0, 200, '…'),
            'similarity'     => round((float) $chunk->similarity, 3),
        ])->values()->all();
    }
}
