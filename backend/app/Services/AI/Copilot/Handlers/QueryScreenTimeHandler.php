<?php

namespace App\Services\AI\Copilot\Handlers;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\DTOs\AI\ScreenTimeData;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;
use App\Repositories\ScreenTimeSessionRepository;
use Carbon\Carbon;

/**
 * Returns the creator's own screen time / wellness statistics.
 * No Gemini call — pure data query and formatting.
 */
class QueryScreenTimeHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function __construct(
        GeminiClientInterface                        $gemini,
        private readonly ScreenTimeSessionRepository $screenTimeRepo,
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
        if (! $context->userId) {
            return new CopilotHandlerResult(
                text: 'Không xác định được tài khoản.',
                followUpChips: ['Thử lại'],
            );
        }

        $userId  = $context->userId;
        $todayStart = Carbon::now()->startOfDay();
        $weekStart  = Carbon::now()->subDays(6)->startOfDay();
        $now        = Carbon::now();

        $stats = new ScreenTimeData(
            todayTotalSeconds: $this->screenTimeRepo->sumSecondsInRange($userId, $todayStart, $now),
            todayVideoSeconds: $this->screenTimeRepo->sumVideoSecondsInRange($userId, $todayStart, $now),
            weekTotalSeconds:  $this->screenTimeRepo->sumSecondsInRange($userId, $weekStart, $now),
            weekVideoSeconds:  $this->screenTimeRepo->sumVideoSecondsInRange($userId, $weekStart, $now),
            todaySessions:     $this->screenTimeRepo->countInRange($userId, $todayStart, $now),
        );

        return new CopilotHandlerResult(
            text:          $this->formatStats($stats),
            followUpChips: ['Đặt giới hạn thời gian', 'Xem thống kê tuần trước', 'Tư vấn sức khoẻ số'],
        );
    }

    private function formatStats(ScreenTimeData $stats): string
    {
        $todayPct = $stats->todayTotalSeconds > 0
            ? round($stats->todayVideoSeconds / $stats->todayTotalSeconds * 100)
            : 0;

        return <<<MD
## ⏱ Thời gian sử dụng của bạn

### Hôm nay
- **Tổng thời gian:** {$stats->todayTotalFormatted()}
- **Xem video:** {$this->formatSeconds($stats->todayVideoSeconds)} ({$todayPct}%)
- **Số phiên:** {$stats->todaySessions} phiên

### 7 ngày qua
- **Tổng thời gian:** {$stats->weekTotalFormatted()}
- **Xem video:** {$this->formatSeconds($stats->weekVideoSeconds)}
- **Trung bình/ngày:** {$this->formatSeconds(intdiv($stats->weekTotalSeconds, 7))}
MD;
    }

    private function formatSeconds(int $seconds): string
    {
        $h = intdiv($seconds, 3600);
        $m = intdiv($seconds % 3600, 60);

        if ($h > 0) {
            return "{$h} giờ {$m} phút";
        }

        return "{$m} phút";
    }
}
