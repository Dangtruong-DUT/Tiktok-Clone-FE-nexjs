<?php

namespace App\Services\AI\Copilot\Handlers;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;
use Illuminate\Support\Facades\DB;

/**
 * Returns today's notification summary for the authenticated user.
 * Pure data query — no Gemini call.
 */
class QueryNotificationsHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function __construct(GeminiClientInterface $gemini)
    {
        parent::__construct($gemini);
    }

    public function handle(
        AiCopilotIntentEnum     $intent,
        AiCopilotMessageInput   $input,
        AiCopilotSessionContext $context,
        AiPromptTemplate        $template,
        array                   $conversationHistory,
    ): CopilotHandlerResult {
        if (! $context->userId) {
            return new CopilotHandlerResult(
                text: 'Không thể xác định người dùng để lấy thông báo.',
                followUpChips: ['Thống kê tài khoản của tôi'],
            );
        }

        // Today's notifications for this user
        $today = DB::table('notifications')
            ->where('notifiable_id', $context->userId)
            ->whereNull('deleted_at')
            ->whereDate('created_at', today())
            ->selectRaw('type, COUNT(*) as total, SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread')
            ->groupBy('type')
            ->get()
            ->toArray();

        $totalToday  = array_sum(array_column($today, 'total'));
        $unreadToday = array_sum(array_column($today, 'unread'));

        // All-time unread count
        $totalUnread = DB::table('notifications')
            ->where('notifiable_id', $context->userId)
            ->whereNull('deleted_at')
            ->where('is_read', false)
            ->count();

        return new CopilotHandlerResult(
            text: $this->format($today, $totalToday, $unreadToday, $totalUnread),
            followUpChips: ['Thống kê tài khoản của tôi', 'Xem bài đăng gần đây', 'Thống kê bài đăng'],
        );
    }

    private function format(array $rows, int $totalToday, int $unreadToday, int $totalUnread): string
    {
        $typeLabels = [
            1 => 'Like',
            2 => 'Bình luận',
            3 => 'Follow',
            4 => 'Mention',
            5 => 'Hashtag',
            6 => 'Hệ thống',
            7 => 'Admin',
            8 => 'Bảo mật',
        ];

        if ($totalToday === 0) {
            $unreadNote = $totalUnread > 0
                ? "\n\n> Bạn có **{$totalUnread}** thông báo chưa đọc từ trước."
                : '';

            return "## Thông báo hôm nay\n\nBạn không có thông báo nào hôm nay.{$unreadNote}";
        }

        $rows_md = '';
        foreach ($rows as $row) {
            $label    = $typeLabels[$row->type] ?? "Type {$row->type}";
            $unreadMd = $row->unread > 0 ? " (**{$row->unread} chưa đọc**)" : '';
            $rows_md .= "| {$label} | {$row->total}{$unreadMd} |\n";
        }

        $summary = "Tổng hôm nay: **{$totalToday}** | Chưa đọc hôm nay: **{$unreadToday}**";
        if ($totalUnread > $unreadToday) {
            $summary .= " | Tổng chưa đọc: **{$totalUnread}**";
        }

        return <<<MD
## Thông báo hôm nay

| Loại | Số lượng |
|---|---|
{$rows_md}
{$summary}
MD;
    }
}
