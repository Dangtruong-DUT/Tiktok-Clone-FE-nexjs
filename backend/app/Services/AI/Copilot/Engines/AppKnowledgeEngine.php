<?php

namespace App\Services\AI\Copilot\Engines;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Services\AI\Copilot\Engines\Contracts\CopilotEngineInterface;
use App\Services\AI\Copilot\Gateway\GatewayTask;
use App\Services\AI\Rag\GeminiEmbeddingService;
use App\Services\AI\Rag\PgVectorSearchService;
use App\Services\AI\Rag\RagService;

/**
 * Answers questions about Snapi Studio features and platform documentation.
 * Tries RAG first (pgvector search → Gemini synthesis); falls back to static knowledge.
 */
class AppKnowledgeEngine extends AbstractCopilotEngine implements CopilotEngineInterface
{
    /**
     * @param  \App\Contracts\AI\GeminiClientInterface  $gemini
     * @param  \App\Repositories\AiPromptTemplateRepository  $templateRepo
     * @param  RagService  $ragService
     * @param  GeminiEmbeddingService  $embeddingService
     * @param  PgVectorSearchService  $searchService
     */
    public function __construct(
        \App\Contracts\AI\GeminiClientInterface      $gemini,
        \App\Repositories\AiPromptTemplateRepository $templateRepo,
        private readonly RagService                  $ragService,
        private readonly GeminiEmbeddingService      $embeddingService,
        private readonly PgVectorSearchService       $searchService,
    ) {
        parent::__construct($gemini, $templateRepo);
    }

    /**
     * Handle an app_knowledge query using RAG + Gemini synthesis.
     *
     * @param  GatewayTask             $task
     * @param  AiCopilotMessageInput   $input
     * @param  AiCopilotSessionContext  $context
     * @param  array<array{role: string, parts: array}>  $conversationHistory
     * @param  callable(string $chunk, bool $done): void|null  $emit
     * @return CopilotHandlerResult
     */
    public function handle(
        GatewayTask            $task,
        AiCopilotMessageInput  $input,
        AiCopilotSessionContext $context,
        array                  $conversationHistory,
        ?callable              $emit = null,
    ): CopilotHandlerResult {
        $locale = $context->creatorLanguage ?? 'vi';

        $ragResult = $this->tryRag($input->content, $conversationHistory, $locale, $emit);

        if ($ragResult !== null) {
            if ($emit !== null) {
                $emit($ragResult['answer'], true);
            }

            return new CopilotHandlerResult(
                text:          $ragResult['answer'],
                structuredOutput: $ragResult['citations'] ? ['type' => 'citations', 'items' => $ragResult['citations']] : null,
                followUpChips: $this->followUpChips($locale),
            );
        }

        $staticText = $this->buildStaticResponse($locale);

        if ($emit !== null) {
            $emit($staticText, true);
        }

        return new CopilotHandlerResult(
            text:          $staticText,
            followUpChips: $this->followUpChips($locale),
        );
    }

    /**
     * Attempt RAG: embed → search → Gemini synthesis.
     * Passes pre-fetched chunks directly to RagService to avoid double embedding.
     * Returns null when no matching chunks are found.
     *
     * @param  string    $question
     * @param  array<array{role: string, parts: array}>  $conversationHistory
     * @param  string    $locale
     * @param  callable(string $chunk, bool $done): void|null  $emit
     * @return array{answer: string, citations: list<array<string,mixed>>}|null
     */
    private function tryRag(string $question, array $conversationHistory, string $locale, ?callable $emit = null): ?array
    {
        try {
            $embedding = $this->embeddingService->embed($question, 'RETRIEVAL_QUERY');
            $chunks    = $this->searchService->search($embedding, limit: 5, threshold: 0.70);

            if ($chunks->isEmpty()) {
                return null;
            }

            // $conversationHistory is already Gemini native format — pass directly, no conversion
            return $this->ragService->answerWithChunks($question, $chunks, $conversationHistory, $locale, $emit);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Build a static fallback response with core Snapi Studio feature overview.
     *
     * @param  string  $locale
     * @return string
     */
    private function buildStaticResponse(string $locale): string
    {
        return (string) trans('copilot.messages.app_knowledge_fallback', [], $locale);
    }

    /**
     * Return follow-up chip suggestions for app knowledge queries.
     *
     * @return list<string>
     */
    private function followUpChips(string $locale): array
    {
        $chips = trans('copilot.chips.app_knowledge', [], $locale);

        return is_array($chips) ? $chips : [];
    }
}
