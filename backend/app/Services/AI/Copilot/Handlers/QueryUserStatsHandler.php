<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\DTOs\AI\UserStatsData;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;
use App\Repositories\UserRepository;
use App\Services\AI\GeminiAiService;

/**
 * Returns the authenticated creator's own profile statistics.
 * No Gemini call — pure data query and formatting.
 */
class QueryUserStatsHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function __construct(
        protected readonly GeminiAiService $gemini,
        private readonly UserRepository    $userRepo,
    ) {}

    public function handle(
        AiCopilotIntentEnum     $intent,
        AiCopilotMessageInput   $input,
        AiCopilotSessionContext $context,
        AiPromptTemplate        $template,
        array                   $conversationHistory,
    ): CopilotHandlerResult {
        $user = $context->userId ? $this->userRepo->find($context->userId) : null;

        if (! $user) {
            return new CopilotHandlerResult(
                text: 'Không tìm thấy thông tin tài khoản.',
                followUpChips: ['Thử lại', 'Hỏi câu khác'],
            );
        }

        $stats = new UserStatsData(
            name:           $user->name,
            username:       $user->username,
            followersCount: (int) $user->followers_count,
            followingCount: (int) $user->following_count,
            postsCount:     $user->posts()->count(),
            joinedAt:       $user->created_at->format('d/m/Y'),
            role:           $user->role->translate(),
        );

        return new CopilotHandlerResult(
            text:          $this->formatStats($stats),
            followUpChips: ['Xem bài đăng của tôi', 'Xem screen time', 'Tư vấn tăng followers'],
        );
    }

    private function formatStats(UserStatsData $stats): string
    {
        return <<<MD
## 👤 Thông tin tài khoản của bạn

| Thông tin | Giá trị |
|---|---|
| **Tên** | {$stats->name} |
| **Username** | @{$stats->username} |
| **Followers** | {$stats->followersCount} |
| **Đang theo dõi** | {$stats->followingCount} |
| **Số bài đăng** | {$stats->postsCount} |
| **Tham gia** | {$stats->joinedAt} |
| **Vai trò** | {$stats->role} |
MD;
    }
}
