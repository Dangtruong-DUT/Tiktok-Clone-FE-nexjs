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
 * Returns video encoding queue status and recent failures for admin users.
 * No Gemini call — pure data query and formatting.
 */
class AdminQueryEncodingHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
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

        $pending    = DB::table('video_encodings')->where('status', 0)->count();
        $processing = DB::table('video_encodings')->where('status', 1)->count();
        $ready      = DB::table('video_encodings')->where('status', 2)->count();
        $failed     = DB::table('video_encodings')->where('status', 3)->count();

        // Stuck jobs: processing for more than 30 minutes
        $stuckCount = DB::table('video_encodings')
            ->where('status', 1)
            ->where('started_at', '<', now()->subMinutes(30))
            ->count();

        // Recent failures (last 5)
        $recentFailed = DB::table('video_encodings')
            ->where('status', 3)
            ->orderBy('updated_at', 'desc')
            ->limit(5)
            ->get(['id', 'error_message', 'updated_at']);

        return new CopilotHandlerResult(
            text: $this->formatEncoding($pending, $processing, $ready, $failed, $stuckCount, $recentFailed),
            followUpChips: ['Thống kê hệ thống', 'Thống kê AI', 'Kháng cáo chờ xử lý'],
        );
    }

    private function formatEncoding(
        int $pending,
        int $processing,
        int $ready,
        int $failed,
        int $stuckCount,
        $recentFailed,
    ): string {
        $failWarn = $failed > 0 ? ' ⚠️' : '';

        $failedRows = '';
        foreach ($recentFailed as $job) {
            $errMsg     = mb_substr((string) ($job->error_message ?? 'Không rõ'), 0, 60);
            $updatedAt  = $job->updated_at ? date('d/m H:i', strtotime($job->updated_at)) : '?';
            $failedRows .= "| #{$job->id} | {$errMsg} | {$updatedAt} |\n";
        }

        $stuckLine = $stuckCount > 0
            ? "**{$stuckCount} job** đang xử lý quá 30 phút — có thể bị treo ⚠️"
            : 'Không có job bị treo';

        $failedSection = $recentFailed->isEmpty()
            ? '_Không có video lỗi gần đây._'
            : "| Video ID | Lỗi | Thời điểm |\n|---|---|---|\n{$failedRows}";

        return <<<MD
## Hàng đợi mã hoá

| Trạng thái | Số lượng |
|---|---|
| Chờ xử lý (pending) | {$pending} |
| Đang xử lý | {$processing} |
| Hoàn thành | {$ready} |
| Lỗi{$failWarn} | {$failed} |

## Job bị treo

{$stuckLine}

## Video lỗi gần đây (tối đa 5){$failWarn}

{$failedSection}
MD;
    }
}
