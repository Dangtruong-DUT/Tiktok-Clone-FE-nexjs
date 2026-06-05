<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;
use App\Services\AI\GeminiAiService;

/**
 * Answers questions about Snapi Studio features and how to use them.
 * No Gemini call, no DB access — static app knowledge base.
 */
class QueryAppInfoHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function __construct(
        protected readonly GeminiAiService $gemini,
    ) {}

    public function handle(
        AiCopilotIntentEnum     $intent,
        AiCopilotMessageInput   $input,
        AiCopilotSessionContext $context,
        AiPromptTemplate        $template,
        array                   $conversationHistory,
    ): CopilotHandlerResult {
        return new CopilotHandlerResult(
            text:          $this->buildAppInfo(),
            followUpChips: ['Hướng dẫn đăng video', 'Tính năng AI Copilot', 'Đường đến trang cài đặt'],
        );
    }

    private function buildAppInfo(): string
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

**📊 Quản lý nội dung**
- Xem toàn bộ bài đăng theo trạng thái (đã đăng, nháp, thất bại)
- Lên lịch và quản lý bài đăng tự động
- Theo dõi lượt xem, likes, bình luận

**⏱ Wellness & Screen Time**
- Theo dõi thời gian sử dụng ứng dụng
- Thiết lập giới hạn thời gian lành mạnh
- Nhận cảnh báo khi vượt giới hạn

**🔔 Khiếu nại & Hỗ trợ**
- Gửi khiếu nại về quyết định kiểm duyệt
- Theo dõi trạng thái xử lý

### Cần giúp gì cụ thể?
Hỏi tôi về bất kỳ tính năng nào hoặc gõ "đường đến [tên trang]" để tôi dẫn bạn đến đúng trang!
MD;
    }
}
