<?php

namespace App\Services\AI\Copilot\Handlers;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\DTOs\AI\PostStatsData;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;
use App\Models\Post;

/**
 * Returns the creator's own recent posts with basic engagement stats.
 * No Gemini call — pure data query and formatting.
 */
class QueryPostStatsHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    private const MAX_POSTS = 10;

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
                text: 'Không xác định được tài khoản.',
                followUpChips: ['Thử lại'],
            );
        }

        $posts = Post::where('user_id', $context->userId)
            ->orderByDesc('created_at')
            ->limit(self::MAX_POSTS)
            ->get(['uuid', 'content', 'status', 'likes_count', 'comments_count',
                   'user_views', 'guest_views', 'published_at', 'created_at']);

        if ($posts->isEmpty()) {
            return new CopilotHandlerResult(
                text: 'Bạn chưa có bài đăng nào. Hãy bắt đầu đăng video đầu tiên! 🎬',
                followUpChips: ['Hướng dẫn đăng video', 'Viết caption cho video', 'Tạo hashtag'],
            );
        }

        $rows = $posts->map(fn (Post $p) => new PostStatsData(
            uuid:           $p->uuid,
            contentSnippet: mb_strimwidth($p->content ?? '', 0, 60, '…'),
            status:         $p->status->value ?? (string) $p->status,
            likesCount:     (int) $p->likes_count,
            viewsCount:     (int) ($p->user_views + $p->guest_views),
            commentsCount:  (int) $p->comments_count,
            publishedAt:    $p->published_at?->format('d/m/Y'),
            scheduledAt:    null,
        ));

        return new CopilotHandlerResult(
            text:          $this->formatPosts($rows->all()),
            followUpChips: ['Phân tích viral bài đăng này', 'Viết lại caption', 'Tạo hashtag mới'],
        );
    }

    /** @param PostStatsData[] $posts */
    private function formatPosts(array $posts): string
    {
        $rows = implode("\n", array_map(fn (PostStatsData $p) =>
            "| {$p->contentSnippet} | {$p->status} | {$p->viewsCount} | {$p->likesCount} | {$p->commentsCount} | {$p->publishedAt} |",
            $posts,
        ));

        return <<<MD
## 📊 {$this->count(count($posts))} bài đăng gần nhất của bạn

| Nội dung | Trạng thái | Lượt xem | Likes | Bình luận | Đăng ngày |
|---|---|---|---|---|---|
{$rows}
MD;
    }

    private function count(int $n): string
    {
        return (string) $n;
    }
}
