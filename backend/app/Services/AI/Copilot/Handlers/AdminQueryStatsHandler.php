<?php

namespace App\Services\AI\Copilot\Handlers;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Enums\User\RoleTypeEnum;
use App\Enums\User\UserVerifyStatusEnum;
use App\Models\AiPromptTemplate;
use App\Services\Admin\AiStudioAdminService;
use Illuminate\Support\Facades\DB;

/**
 * Returns platform-wide analytics for admin users only.
 * Renders a targeted summary based on what the user actually asked,
 * rather than dumping all available data.
 */
class AdminQueryStatsHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function __construct(
        GeminiClientInterface                 $gemini,
        private readonly AiStudioAdminService $adminService,
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
        $user = $context->userId
            ? \App\Models\User::find($context->userId)
            : null;

        if (! $user || $user->role !== RoleTypeEnum::SUPER_ADMIN) {
            return new CopilotHandlerResult(
                text: '🔒 Tính năng này chỉ dành cho quản trị viên.',
                followUpChips: ['Thống kê bài đăng của tôi', 'Xem screen time'],
            );
        }

        $msg = mb_strtolower($input->content);

        // Route to targeted section based on user's question
        if ($this->matchesUser($msg)) {
            return $this->userSection();
        }
        if ($this->matchesContent($msg)) {
            return $this->contentSection();
        }
        if ($this->matchesEngagement($msg)) {
            return $this->engagementSection();
        }

        // Default: executive summary (5 key numbers)
        return $this->executiveSummary();
    }

    // ─── Section detectors ────────────────────────────────────────────────────

    private function matchesUser(string $msg): bool
    {
        return $this->hasAny($msg, [
            'người dùng', 'user', 'tài khoản', 'account',
            'đăng ký', 'signup', 'register', 'xác thực', 'verified',
            'banned', 'cấm', 'new user', 'thành viên',
        ]);
    }

    private function matchesContent(string $msg): bool
    {
        return $this->hasAny($msg, [
            'bài đăng', 'post', 'video', 'nội dung', 'content',
            'nháp', 'draft', 'lên lịch', 'scheduled',
        ]);
    }

    private function matchesEngagement(string $msg): bool
    {
        return $this->hasAny($msg, [
            'tương tác', 'engagement', 'view', 'like', 'comment',
            'lượt xem', 'lượt thích', 'bình luận',
        ]);
    }

    private function hasAny(string $hay, array $needles): bool
    {
        foreach ($needles as $n) {
            if (str_contains($hay, $n)) {
                return true;
            }
        }
        return false;
    }

    // ─── Targeted sections ────────────────────────────────────────────────────

    private function userSection(): CopilotHandlerResult
    {
        $totalUsers    = DB::table('users')->whereNull('deleted_at')->count();
        $bannedUsers   = DB::table('users')->whereNull('deleted_at')->whereNotNull('banned_at')->count();
        $verifiedUsers = DB::table('users')->whereNull('deleted_at')->where('verify', UserVerifyStatusEnum::VERIFIED->value)->count();

        $newToday     = DB::table('users')->whereNull('deleted_at')->whereDate('created_at', today())->count();
        $newYesterday = DB::table('users')->whereNull('deleted_at')->whereDate('created_at', today()->subDay())->count();
        $newWeek      = DB::table('users')->whereNull('deleted_at')->where('created_at', '>=', now()->subDays(7))->count();
        $newLastWeek  = DB::table('users')->whereNull('deleted_at')
            ->whereBetween('created_at', [now()->subDays(14), now()->subDays(7)])->count();

        $todayPct = $newYesterday > 0
            ? round(($newToday - $newYesterday) / $newYesterday * 100, 1)
            : null;
        $weekPct  = $newLastWeek > 0
            ? round(($newWeek - $newLastWeek) / $newLastWeek * 100, 1)
            : null;

        $todayStr = $this->pctStr($newToday, $todayPct, 'so với hôm qua');
        $weekStr  = $this->pctStr($newWeek, $weekPct, 'so với tuần trước');

        return new CopilotHandlerResult(
            text: <<<MD
## Thống kê người dùng
| Chỉ số | Giá trị |
|---|---|
| Tổng tài khoản | {$totalUsers} |
| Đã xác thực | {$verifiedUsers} |
| Bị cấm | {$bannedUsers} |
| Đăng ký hôm nay | {$todayStr} |
| Đăng ký 7 ngày | {$weekStr} |
MD,
            followUpChips: ['Thống kê nội dung', 'Kháng cáo chờ xử lý', 'Thống kê hệ thống'],
        );
    }

    private function contentSection(): CopilotHandlerResult
    {
        $postCounts    = DB::table('posts')->whereNull('deleted_at')
            ->selectRaw('status, COUNT(*) as cnt')->groupBy('status')
            ->pluck('cnt', 'status')->toArray();
        $totalPosts    = array_sum($postCounts);

        $newToday     = DB::table('posts')->whereNull('deleted_at')->whereDate('created_at', today())->count();
        $newYesterday = DB::table('posts')->whereNull('deleted_at')->whereDate('created_at', today()->subDay())->count();
        $todayPct     = $newYesterday > 0
            ? round(($newToday - $newYesterday) / $newYesterday * 100, 1)
            : null;
        $todayStr     = $this->pctStr($newToday, $todayPct, 'so với hôm qua');

        $published = $postCounts['published'] ?? 0;
        $draft     = $postCounts['draft']     ?? 0;
        $scheduled = $postCounts['scheduled'] ?? 0;
        $failed    = $postCounts['failed']    ?? 0;

        $encodingFailed = DB::table('video_encodings')->where('status', 3)->count();
        $encodingActive = DB::table('video_encodings')->whereIn('status', [0, 1])->count();
        $encWarn        = $encodingFailed > 0 ? " ⚠️" : '';

        return new CopilotHandlerResult(
            text: <<<MD
## Thống kê nội dung
| Chỉ số | Giá trị |
|---|---|
| Tổng bài đăng | {$totalPosts} |
| Đã đăng | {$published} |
| Nháp | {$draft} |
| Lên lịch | {$scheduled} |
| Lỗi | {$failed} |
| Đăng mới hôm nay | {$todayStr} |
| Video đang mã hoá | {$encodingActive} |
| Video lỗi mã hoá | {$encodingFailed}{$encWarn} |
MD,
            followUpChips: ['Video lỗi encoding', 'Thống kê người dùng', 'Thống kê hệ thống'],
        );
    }

    private function engagementSection(): CopilotHandlerResult
    {
        $engagement = DB::table('posts')->whereNull('deleted_at')
            ->selectRaw('COALESCE(SUM(user_views+guest_views),0) AS views, COALESCE(SUM(likes_count),0) AS likes, COALESCE(SUM(comments_count),0) AS comments')
            ->first();

        return new CopilotHandlerResult(
            text: <<<MD
## Tương tác toàn nền tảng
| Chỉ số | Giá trị |
|---|---|
| Tổng lượt xem | {$engagement->views} |
| Tổng like | {$engagement->likes} |
| Tổng bình luận | {$engagement->comments} |
MD,
            followUpChips: ['Thống kê nội dung', 'Thống kê người dùng', 'Thống kê hệ thống'],
        );
    }

    private function executiveSummary(): CopilotHandlerResult
    {
        // Users
        $totalUsers   = DB::table('users')->whereNull('deleted_at')->count();
        $newToday     = DB::table('users')->whereNull('deleted_at')->whereDate('created_at', today())->count();
        $newYesterday = DB::table('users')->whereNull('deleted_at')->whereDate('created_at', today()->subDay())->count();
        $userPct      = $newYesterday > 0 ? round(($newToday - $newYesterday) / $newYesterday * 100, 1) : null;

        // Posts
        $totalPosts   = DB::table('posts')->whereNull('deleted_at')->count();
        $newPosts     = DB::table('posts')->whereNull('deleted_at')->whereDate('created_at', today())->count();

        // Warnings
        $appealPending  = DB::table('appeals')->where('status', 'pending')->count();
        $encodingFailed = DB::table('video_encodings')->where('status', 3)->count();
        $encodingActive = DB::table('video_encodings')->whereIn('status', [0, 1])->count();

        // AI today
        $aiToday  = $this->adminService->getMetrics('today');
        $costToday = number_format((float) ($aiToday['total_cost_usd'] ?? 0), 4);

        $userStr    = $this->pctStr($newToday, $userPct, 'vs hôm qua');
        $appealWarn = $appealPending > 0 ? " ⚠️ **{$appealPending} chờ xử lý**" : ' ✓';
        $encWarn    = $encodingFailed > 0 ? " ⚠️ **{$encodingFailed} lỗi**" : ($encodingActive > 0 ? " ({$encodingActive} đang xử lý)" : ' ✓');

        return new CopilotHandlerResult(
            text: <<<MD
## Tóm tắt hệ thống

| Chỉ số | Giá trị |
|---|---|
| Tổng tài khoản | {$totalUsers} |
| Đăng ký hôm nay | {$userStr} |
| Tổng bài đăng | {$totalPosts} |
| Bài đăng hôm nay | {$newPosts} |
| Kháng cáo |{$appealWarn} |
| Video encoding |{$encWarn} |
| Chi phí AI hôm nay | \${$costToday} |

> Hỏi cụ thể hơn để xem chi tiết: _"Thống kê người dùng"_, _"Thống kê nội dung"_, _"Kháng cáo chờ xử lý"_, _"Chi phí AI hôm nay"_.
MD,
            followUpChips: ['Thống kê người dùng', 'Kháng cáo chờ xử lý', 'Chi phí AI hôm nay', 'Video lỗi encoding'],
        );
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function pctStr(int $value, ?float $pct, string $label): string
    {
        if ($pct === null) {
            return (string) $value;
        }

        $sign  = $pct >= 0 ? '+' : '';
        $arrow = $pct > 0 ? '↑' : ($pct < 0 ? '↓' : '→');

        return "{$value} ({$arrow}{$sign}{$pct}% {$label})";
    }
}
