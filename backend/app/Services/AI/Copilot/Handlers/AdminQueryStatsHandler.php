<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Enums\User\RoleTypeEnum;
use App\Models\AiPromptTemplate;
use App\Services\Admin\AiStudioAdminService;
use App\Services\AI\GeminiAiService;

/**
 * Returns platform-wide AI/usage analytics for admin users only.
 * Security gate: denies access if user is not SUPER_ADMIN.
 * No Gemini call — pure data query and formatting.
 */
class AdminQueryStatsHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function __construct(
        protected readonly GeminiAiService    $gemini,
        private readonly AiStudioAdminService $adminService,
    ) {}

    public function handle(
        AiCopilotIntentEnum     $intent,
        AiCopilotMessageInput   $input,
        AiCopilotSessionContext $context,
        AiPromptTemplate        $template,
        array                   $conversationHistory,
    ): CopilotHandlerResult {
        // Security gate — only SUPER_ADMIN may access platform-wide stats
        $user = $context->userId
            ? \App\Models\User::find($context->userId)
            : null;

        if (! $user || $user->role !== RoleTypeEnum::SUPER_ADMIN) {
            return new CopilotHandlerResult(
                text: '🔒 Tính năng này chỉ dành cho quản trị viên. Bạn không có quyền truy cập thống kê hệ thống.',
                followUpChips: ['Thống kê bài đăng của tôi', 'Xem screen time', 'Hỏi câu khác'],
            );
        }

        $today = $this->adminService->getMetrics('today');
        $week  = $this->adminService->getMetrics('week');

        return new CopilotHandlerResult(
            text:          $this->formatStats($today, $week),
            followUpChips: ['Thống kê theo tháng', 'Xem intent phổ biến', 'Chi phí AI hôm nay'],
        );
    }

    private function formatStats(array $today, array $week): string
    {
        $successToday = number_format((float) ($today['success_rate'] ?? 0), 1);
        $successWeek  = number_format((float) ($week['success_rate']  ?? 0), 1);
        $costToday    = number_format((float) ($today['total_cost_usd'] ?? 0), 4);
        $costWeek     = number_format((float) ($week['total_cost_usd']  ?? 0), 4);

        $topIntents = '';
        if (! empty($today['intent_breakdown']) && is_array($today['intent_breakdown'])) {
            arsort($today['intent_breakdown']);
            $top = array_slice($today['intent_breakdown'], 0, 5, true);
            foreach ($top as $k => $v) {
                $topIntents .= "- **{$k}**: {$v} lần\n";
            }
        }

        return <<<MD
## 📊 Thống kê hệ thống Snapi AI

### Hôm nay
| Chỉ số | Giá trị |
|---|---|
| Tổng yêu cầu | {$today['total_requests']} |
| Thành công | {$today['completed']} ({$successToday}%) |
| Thất bại | {$today['failed']} |
| Người dùng | {$today['unique_users']} |
| Tổng tokens | {$today['total_tokens']} |
| Chi phí (USD) | \${$costToday} |

### 7 ngày qua
| Chỉ số | Giá trị |
|---|---|
| Tổng yêu cầu | {$week['total_requests']} |
| Thành công | {$week['completed']} ({$successWeek}%) |
| Người dùng | {$week['unique_users']} |
| Chi phí (USD) | \${$costWeek} |

### Top intents hôm nay
{$topIntents}
MD;
    }
}
