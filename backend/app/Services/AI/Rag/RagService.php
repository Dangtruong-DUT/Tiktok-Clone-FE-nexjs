<?php

namespace App\Services\AI\Rag;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\Gemini\GeminiConfig;
use App\DTOs\AI\Gemini\GeminiRequest;
use App\Models\AiStudioSetting;
use Illuminate\Support\Collection;

class RagService
{
    /**
     * Create a new service instance.
     *
     * @param  GeminiEmbeddingService  $embeddingService
     * @param  PgVectorSearchService  $searchService
     * @param  GeminiClientInterface  $geminiClient
     */
    public function __construct(
        private readonly GeminiEmbeddingService $embeddingService,
        private readonly PgVectorSearchService  $searchService,
        private readonly GeminiClientInterface           $geminiClient,
    ) {}

    /**
     * Answer a question using RAG: embed → search → augment → generate.
     *
     * @param  string  $question
     * @param  array<array{role: string, content: string}>  $conversationHistory
     * @param  string  $locale
     * @return array{answer: string, citations: array<int,array<string,mixed>>, has_docs: bool}
     */
    public function answer(
        string $question,
        array  $conversationHistory = [],
        string $locale = 'vi',
    ): array {
        $embedding = $this->embeddingService->embed($question);
        $chunks    = $this->searchService->search($embedding, limit: 5, threshold: 0.70);

        $context  = $this->buildContext($chunks);
        $hasDocs  = $chunks->isNotEmpty();
        $answer   = $this->generate($question, $context, $conversationHistory, $locale);
        $citations = $this->buildCitations($chunks);

        return [
            'answer'    => $answer,
            'citations' => $citations,
            'has_docs'  => $hasDocs,
        ];
    }

    private function buildContext(Collection $chunks): string
    {
        if ($chunks->isEmpty()) {
            return '';
        }

        $parts = $chunks->map(fn ($chunk, $i) =>
            "--- Nguồn " . ($i + 1) . ": {$chunk->document_title} ---\n{$chunk->content}"
        );

        return $parts->implode("\n\n");
    }

    private function generate(
        string $question,
        string $context,
        array  $history,
        string $locale,
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

        $contents = [];

        foreach ($history as $msg) {
            $contents[] = [
                'role'  => $msg['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $msg['content']]],
            ];
        }

        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $question]],
        ];

        $answer = '';

        $this->geminiClient->stream(
            new GeminiRequest(
                systemPrompt: $systemPrompt,
                contents:     $contents,
                config:       GeminiConfig::fromSetting(AiStudioSetting::current()),
            ),
            function (string $delta, bool $done, array $tokenUsage) use (&$answer) {
                if (! $done) {
                    $answer .= $delta;
                }
            },
        );

        return $answer;
    }

    private function buildCitations(Collection $chunks): array
    {
        return $chunks->map(fn ($chunk) => [
            'document_title'   => $chunk->document_title,
            'source_type'      => $chunk->document_source_type,
            'source_url'       => $chunk->document_source_url,
            'snippet'          => mb_strimwidth($chunk->content, 0, 200, '…'),
            'similarity'       => round((float) $chunk->similarity, 3),
        ])->values()->all();
    }
}
