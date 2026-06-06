<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;
use App\Services\AI\GeminiAiService;
use App\Services\AI\Rag\GeminiEmbeddingService;
use App\Services\AI\Rag\PgVectorSearchService;

/**
 * Handles: general_advice, clarification, and all unrecognised intents.
 * Augments the system prompt with RAG context when relevant documents are found.
 */
class GeneralAdviceHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function __construct(
        GeminiAiService                          $gemini,
        private readonly GeminiEmbeddingService  $embeddingService,
        private readonly PgVectorSearchService   $searchService,
    ) {
        parent::__construct($gemini);
    }

    public function handle(
        AiCopilotIntentEnum     $intent,
        AiCopilotMessageInput   $input,
        AiCopilotSessionContext $context,
        AiPromptTemplate        $template,
        array                   $conversationHistory,
    ): CopilotHandlerResult {
        $startedAt    = hrtime(true);
        $systemPrompt = $this->buildSystemPrompt($template, $context);
        $systemPrompt = $this->tryAugmentWithRag($input->content, $systemPrompt);
        $userTurn     = $this->buildUserTurn($input, $template);
        $contents     = $this->buildContents($conversationHistory, $userTurn);

        $result = $this->gemini->generateWithHistory(
            systemPrompt: $systemPrompt,
            contents:     $contents,
        );

        $latencyMs = (int) round((hrtime(true) - $startedAt) / 1_000_000);

        $followUpChips = $context->userRole === 'super_admin'
            ? ['Thống kê người dùng hệ thống', 'Kháng cáo chờ xử lý', 'Chi phí AI hôm nay', 'Video lỗi encoding']
            : $this->defaultFollowUpChips($intent->value);

        return new CopilotHandlerResult(
            text:             $result['text'],
            structuredOutput: null,
            followUpChips:    $followUpChips,
            targetField:      null,
            tokenUsage:       $result['token_usage'],
            latencyMs:        $latencyMs,
        );
    }

    private function tryAugmentWithRag(string $question, string $systemPrompt): string
    {
        try {
            $embedding = $this->embeddingService->embed($question);
            $chunks    = $this->searchService->search($embedding, limit: 3, threshold: 0.72);

            if ($chunks->isEmpty()) {
                return $systemPrompt;
            }

            $context = $chunks->map(fn ($c, $i) =>
                '**Nguồn ' . ($i + 1) . ': ' . $c->document_title . "**\n" . $c->content
            )->implode("\n\n");

            return $systemPrompt . "\n\n## Tài liệu tham khảo (Knowledge Base)\n{$context}";
        } catch (\Throwable) {
            return $systemPrompt;
        }
    }
}
