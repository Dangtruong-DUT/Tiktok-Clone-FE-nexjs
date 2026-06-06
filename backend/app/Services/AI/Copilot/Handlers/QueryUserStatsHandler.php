<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;
use App\Repositories\UserRepository;
use App\Services\AI\GeminiAiService;
use Illuminate\Support\Facades\DB;

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

        $userId = $user->id;

        // Post counts by status
        $postCounts = DB::table('posts')
            ->where('user_id', $userId)
            ->whereNull('deleted_at')
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        $published = (int) ($postCounts['published'] ?? 0);
        $draft     = (int) ($postCounts['draft']     ?? 0);
        $failed    = (int) ($postCounts['failed']    ?? 0);
        $scheduledCount = (int) ($postCounts['scheduled'] ?? 0);

        // Aggregate engagement across all published posts
        $engagement = DB::table('posts')
            ->where('user_id', $userId)
            ->whereNull('deleted_at')
            ->selectRaw('
                COALESCE(SUM(user_views + guest_views), 0) AS total_views,
                COALESCE(SUM(likes_count), 0)              AS total_likes,
                COALESCE(SUM(comments_count), 0)           AS total_comments
            ')
            ->first();

        $totalViews    = (int) ($engagement->total_views    ?? 0);
        $totalLikes    = (int) ($engagement->total_likes    ?? 0);
        $totalComments = (int) ($engagement->total_comments ?? 0);

        // Appeal counts
        $appealTotal   = DB::table('appeals')->where('user_id', $userId)->count();
        $appealPending = DB::table('appeals')
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->count();

        return new CopilotHandlerResult(
            text: $this->formatStats(
                user:           $user,
                published:      $published,
                draft:          $draft,
                scheduled:      $scheduledCount,
                failed:         $failed,
                totalViews:     $totalViews,
                totalLikes:     $totalLikes,
                totalComments:  $totalComments,
                appealTotal:    $appealTotal,
                appealPending:  $appealPending,
            ),
            followUpChips: ['Xem bài đăng của tôi', 'Xem screen time', 'Tư vấn tăng followers'],
        );
    }

    private function formatStats(
        mixed $user,
        int $published,
        int $draft,
        int $scheduled,
        int $failed,
        int $totalViews,
        int $totalLikes,
        int $totalComments,
        int $appealTotal,
        int $appealPending,
    ): string {
        $joinedAt    = $user->created_at->format('d/m/Y');
        $role        = $user->role->translate();
        $appealBadge = $appealPending > 0 ? " ⚠️ {$appealPending} đang chờ" : '';

        return <<<MD
## Thông tin tài khoản của bạn

| Thông tin | Giá trị |
|---|---|
| **Tên** | {$user->name} |
| **Username** | @{$user->username} |
| **Followers** | {$user->followers_count} |
| **Đang theo dõi** | {$user->following_count} |
| **Tham gia** | {$joinedAt} |
| **Vai trò** | {$role} |

## Thống kê bài đăng

| Trạng thái | Số lượng |
|---|---|
| Đã đăng | {$published} |
| Nháp | {$draft} |
| Đang lên lịch | {$scheduled} |
| Thất bại | {$failed} |

## Tổng tương tác

| Chỉ số | Giá trị |
|---|---|
| Lượt xem | {$totalViews} |
| Lượt thích | {$totalLikes} |
| Bình luận | {$totalComments} |

## Kháng cáo (Appeals)

| Chỉ số | Giá trị |
|---|---|
| Tổng kháng cáo | {$appealTotal} |
| Đang xử lý | {$appealPending}{$appealBadge} |
MD;
    }
}
