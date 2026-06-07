<?php

namespace App\Services\AI\Copilot\Handlers;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Enums\User\RoleTypeEnum;
use App\Models\AiPromptTemplate;
use App\Models\User;
use App\Repositories\AiUsageLogRepository;
use App\Services\Admin\AiStudioAdminService;
use Illuminate\Support\Facades\DB;

/**
 * Returns AI usage/cost breakdown for admin users.
 * No Gemini call — pure data query and formatting.
 */
class AdminQueryAiMetricsHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function __construct(
        GeminiClientInterface                 $gemini,
        private readonly AiStudioAdminService $adminService,
        private readonly AiUsageLogRepository $usageLogRepo,
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
        $user = $context->userId ? User::find($context->userId) : null;

        if (! $user || $user->role !== RoleTypeEnum::SUPER_ADMIN) {
            return new CopilotHandlerResult(
                text: '🔒 Tính năng này chỉ dành cho quản trị viên.',
                followUpChips: ['Thống kê tài khoản của tôi'],
            );
        }

        $today = $this->adminService->getMetrics('today');
        $week  = $this->adminService->getMetrics('week');

        // Top 5 users by token usage (7 days)
        $topUsers = $this->usageLogRepo->topUsersByUsage(5);

        // Resolve usernames for top users
        $userIds = array_filter(array_column($topUsers, 'user_id'));
        $userMap = [];
        if (! empty($userIds)) {
            $userMap = DB::table('users')
                ->whereIn('id', $userIds)
                ->pluck('username', 'id')
                ->toArray();
        }

        return new CopilotHandlerResult(
            text: $this->formatMetrics($today, $week, $topUsers, $userMap),
            followUpChips: ['Thống kê hệ thống', 'Kháng cáo chờ xử lý', 'Video lỗi encoding'],
        );
    }

    private function formatMetrics(array $today, array $week, array $topUsers, array $userMap): string
    {
        $successToday = number_format((float) ($today['success_rate'] ?? 0), 1);
        $successWeek  = number_format((float) ($week['success_rate']  ?? 0), 1);
        $costToday    = number_format((float) ($today['total_cost_usd'] ?? 0), 4);
        $costWeek     = number_format((float) ($week['total_cost_usd']  ?? 0), 4);

        // Top intents today
        $intentRows = '';
        if (! empty($today['intent_breakdown']) && is_array($today['intent_breakdown'])) {
            arsort($today['intent_breakdown']);
            $top = array_slice($today['intent_breakdown'], 0, 5, true);
            foreach ($top as $k => $v) {
                $intentRows .= "| {$k} | {$v} |\n";
            }
        }
        $intentSection = $intentRows
            ? "| Intent | Lần dùng |\n|---|---|\n{$intentRows}"
            : '_Chưa có dữ liệu._';

        // Top users
        $userRows = '';
        foreach ($topUsers as $row) {
            $username = $userMap[$row['user_id']] ?? "uid:{$row['user_id']}";
            $tokens   = number_format((int) $row['tokens']);
            $cost     = number_format((float) $row['cost'], 4);
            $userRows .= "| @{$username} | {$tokens} | \${$cost} |\n";
        }
        $userSection = $userRows
            ? "| Username | Tokens | Chi phí (USD) |\n|---|---|---|\n{$userRows}"
            : '_Chưa có dữ liệu._';

        return <<<MD
## Chi phí & Hiệu suất AI

| Kỳ | Requests | Thành công | Tokens | Chi phí (USD) |
|---|---|---|---|---|
| Hôm nay | {$today['total_requests']} | {$today['completed']} ({$successToday}%) | {$today['total_tokens']} | \${$costToday} |
| 7 ngày | {$week['total_requests']} | {$week['completed']} ({$successWeek}%) | {$week['total_tokens']} | \${$costWeek} |

## Top 5 intents hôm nay

{$intentSection}

## Top 5 người dùng tốn nhiều nhất (7 ngày)

{$userSection}
MD;
    }
}
