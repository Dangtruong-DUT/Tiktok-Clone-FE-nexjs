<?php

namespace App\Services\AI\Copilot\Handlers;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;
use App\Services\AI\Rag\GeminiEmbeddingService;
use App\Services\AI\Rag\PgVectorSearchService;

/**
 * Answers questions about Snapi Studio features.
 * Tries RAG first (indexed docs); falls back to static knowledge if no good matches found.
 */
class QueryAppInfoHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function __construct(
        GeminiClientInterface                    $gemini,
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
        // Attempt RAG — silently fall back to static knowledge on any error
        $ragContext = $this->tryRagSearch($input->content);

        if ($ragContext !== null) {
            return new CopilotHandlerResult(
                text:          $ragContext,
                followUpChips: ['Hướng dẫn đăng video', 'Tính năng AI Copilot', 'Đường đến trang cài đặt'],
            );
        }

        return new CopilotHandlerResult(
            text:          $this->buildStaticAppInfo(),
            followUpChips: ['Hướng dẫn đăng video', 'Tính năng AI Copilot', 'Đường đến trang cài đặt'],
        );
    }

    private function tryRagSearch(string $question): ?string
    {
        try {
            $embedding = $this->embeddingService->embed($question);
            $chunks    = $this->searchService->search($embedding, limit: 4, threshold: 0.72);

            if ($chunks->isEmpty()) {
                return null;
            }

            $context = $chunks->map(fn ($c, $i) =>
                "**Nguồn " . ($i + 1) . ": {$c->document_title}**\n{$c->content}"
            )->implode("\n\n---\n\n");

            return "## 📖 Thông tin từ tài liệu Snapi Studio\n\n{$context}";
        } catch (\Throwable) {
            return null;
        }
    }

    private function buildStaticAppInfo(): string
    {
        return <<<MD
## 🎬 Snapi Studio — Hướng dẫn sử dụng

Snapi Studio là nền tảng sáng tạo nội dung short-form video (tương tự TikTok/Reels).

### Các tính năng chính

**📹 Đăng video**
- Tải lên video từ thiết bị
- Chỉnh sửa thumbnail, caption, hashtag
- Lên lịch đăng hoặc xuất bản ngay

**🤖 AI Copilot (bạn đang dùng)**
- Viết caption & hashtag tự động từ nội dung video
- Phân tích viral potential, hook, retention
- Gợi ý thời điểm đăng tối ưu
- Phân tích đoạn video bằng AI
- Hỗ trợ tiếng Việt và tiếng Anh

**📚 Knowledge Base (RAG)**
- Trò chuyện với tài liệu hướng dẫn chính thức
- Trả lời chính xác dựa trên nguồn đáng tin cậy

**📊 Quản lý nội dung**
- Xem toàn bộ bài đăng theo trạng thái (đã đăng, nháp, thất bại)
- Lên lịch và quản lý bài đăng tự động
- Theo dõi lượt xem, likes, bình luận

**⏱ Wellness & Screen Time**
- Theo dõi thời gian sử dụng ứng dụng
- Thiết lập giới hạn thời gian lành mạnh
- Nhận cảnh báo khi vượt giới hạn

### Cần giúp gì cụ thể?
Hỏi tôi về bất kỳ tính năng nào hoặc gõ "đường đến [tên trang]" để tôi dẫn bạn đến đúng trang!
MD;
    }
}
