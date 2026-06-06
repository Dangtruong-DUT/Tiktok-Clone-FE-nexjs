<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Enums\User\RoleTypeEnum;
use App\Models\AiPromptTemplate;
use App\Models\User;
use App\Services\AI\GeminiAiService;
use Illuminate\Support\Facades\DB;

/**
 * Returns detailed appeal breakdown for admin users.
 * No Gemini call — pure data query and formatting.
 */
class AdminQueryAppealsHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
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
        $user = $context->userId ? User::find($context->userId) : null;

        if (! $user || $user->role !== RoleTypeEnum::SUPER_ADMIN) {
            return new CopilotHandlerResult(
                text: '🔒 Tính năng này chỉ dành cho quản trị viên.',
                followUpChips: ['Thống kê tài khoản của tôi'],
            );
        }

        // Pending breakdown by type
        $byType = DB::table('appeals')
            ->where('status', 'pending')
            ->selectRaw('appeal_type, COUNT(*) as cnt')
            ->groupBy('appeal_type')
            ->pluck('cnt', 'appeal_type')
            ->toArray();

        $totalPending = array_sum($byType);

        // Oldest pending appeal
        $oldest = DB::table('appeals')
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->value('created_at');

        $oldestDays = $oldest ? (int) now()->diffInDays($oldest) : null;

        // 7-day history
        $approved = DB::table('appeals')
            ->where('status', 'approved')
            ->where('reviewed_at', '>=', now()->subDays(7))
            ->count();

        $rejected = DB::table('appeals')
            ->where('status', 'rejected')
            ->where('reviewed_at', '>=', now()->subDays(7))
            ->count();

        $newThisWeek  = DB::table('appeals')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();
        $newLastWeek  = DB::table('appeals')
            ->whereBetween('created_at', [now()->subDays(14), now()->subDays(7)])
            ->count();

        $totalAppeals = DB::table('appeals')->count();

        $weekPct = $newLastWeek > 0
            ? round(($newThisWeek - $newLastWeek) / $newLastWeek * 100, 1)
            : null;

        return new CopilotHandlerResult(
            text: $this->formatAppeals(
                $byType, $totalPending,
                $approved, $rejected, $newThisWeek, $weekPct,
                $totalAppeals, $oldestDays,
            ),
            followUpChips: ['Thống kê hệ thống', 'Video lỗi encoding', 'Chi phí AI hôm nay'],
        );
    }

    private function formatAppeals(
        array $byType,
        int $totalPending,
        int $approved,
        int $rejected,
        int $newThisWeek,
        ?float $weekPct,
        int $totalAppeals,
        ?int $oldestDays,
    ): string {
        $warn = $totalPending > 0 ? ' ⚠️' : '';

        $typeLabels = [
            'user_ban'        => 'Kháng cáo cấm tài khoản',
            'user_deleted'    => 'Kháng cáo xoá tài khoản',
            'post_deleted'    => 'Kháng cáo xoá bài đăng',
            'comment_deleted' => 'Kháng cáo xoá bình luận',
        ];

        $typeRows = '';
        foreach ($typeLabels as $key => $label) {
            $cnt = $byType[$key] ?? 0;
            $typeRows .= "| {$label} | {$cnt} |\n";
        }

        $oldestLine = $oldestDays !== null
            ? "Kháng cáo chờ lâu nhất: **{$oldestDays} ngày**"
            : 'Không có kháng cáo đang chờ';

        $weekPctStr = '';
        if ($weekPct !== null) {
            $sign  = $weekPct >= 0 ? '+' : '';
            $arrow = $weekPct > 0 ? '↑' : ($weekPct < 0 ? '↓' : '→');
            $weekPctStr = " ({$arrow}{$sign}{$weekPct}% so với tuần trước)";
        }

        return <<<MD
## Kháng cáo chờ xử lý{$warn}

| Loại kháng cáo | Số lượng |
|---|---|
{$typeRows}| **Tổng chờ** | **{$totalPending}** |

{$oldestLine}

## Thống kê 7 ngày qua

| Chỉ số | Giá trị |
|---|---|
| Kháng cáo mới | {$newThisWeek}{$weekPctStr} |
| Đã duyệt | {$approved} |
| Đã từ chối | {$rejected} |

## Tổng kháng cáo toàn hệ thống: {$totalAppeals}
MD;
    }
}
