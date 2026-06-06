<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\Enums\Ai\AiCopilotMessageRoleEnum;
use App\Models\AiCopilotMessage;
use App\Models\AiCopilotSession;
use App\Models\AiPromptTemplate;
use App\Repositories\AiCopilotMessageRepository;
use App\Services\AI\GeminiAiService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

abstract class AbstractCopilotHandler
{
    protected const HISTORY_WINDOW = 10;

    public function __construct(
        protected readonly GeminiAiService $gemini,
    ) {}

    public static function buildSystemPrompt(AiPromptTemplate $template, AiCopilotSessionContext $context): string
    {
        // Load the role-appropriate platform context template from DB (cached for 10 minutes).
        // This injects: platform identity (Snapi Studio only), role context, and response style rules.
        $contextIntent = $context->userRole === 'super_admin'
            ? 'platform_context_admin'
            : 'platform_context_creator';

        $contextTpl = Cache::remember(
            "prompt_tpl:{$contextIntent}",
            600,
            fn () => AiPromptTemplate::forIntent($contextIntent)
        );

        $prefix = $contextTpl?->system_prompt ?? '';
        $prompt = $prefix
            ? $prefix . "\n\n---\n\n" . $template->system_prompt
            : $template->system_prompt;

        $contextBlock = $context->toPromptContext();
        if ($contextBlock) {
            $prompt .= "\n\n## Video Context\n{$contextBlock}";
        }

        // Inject live system state for admin users so Gemini can give data-driven advice.
        if ($context->userRole === 'super_admin') {
            $liveState = Cache::remember('admin_live_context', 60, function () {
                $pendingAppeals = DB::table('appeals')->where('status', 'pending')->count();
                $failedEncoding = DB::table('video_encodings')->where('status', 3)->count();
                $activeEncoding = DB::table('video_encodings')->whereIn('status', [0, 1])->count();

                return "## Tình trạng hệ thống (live)\n"
                    . "- Kháng cáo chờ xử lý: {$pendingAppeals}\n"
                    . "- Video lỗi mã hoá: {$failedEncoding}\n"
                    . "- Video đang trong hàng đợi: {$activeEncoding}";
            });
            $prompt .= "\n\n{$liveState}";
        }

        return $prompt;
    }

    public static function buildUserTurn(AiCopilotMessageInput $input, AiPromptTemplate $template): array
    {
        $parts = [];

        // Video clip comes first so the model has full context before the text
        if ($input->hasVideoClip()) {
            $parts[] = [
                'inlineData' => [
                    'mimeType' => 'video/webm',
                    'data'     => $input->videoClipBase64(),
                ],
            ];
        }

        // Individual frames (legacy / manual frame picks)
        if ($input->hasFrames()) {
            foreach ($input->frames as $frame) {
                $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $frame);
                $parts[] = [
                    'inlineData' => [
                        'mimeType' => 'image/jpeg',
                        'data'     => $base64,
                    ],
                ];
            }
        }

        $text = $input->content;

        if ($input->hasTimeline()) {
            $text .= sprintf(
                "\n\n[User selected video segment: %s – %s]",
                self::formatTime($input->timelineStart),
                self::formatTime($input->timelineEnd)
            );
        }

        if ($template->user_template && str_contains($template->user_template, '{{user_message}}')) {
            $text = str_replace('{{user_message}}', $text, $template->user_template);
        }

        $parts[] = ['text' => $text];

        return ['role' => 'user', 'parts' => $parts];
    }

    public static function buildContents(array $history, array $userTurn): array
    {
        $contents   = array_values($history);
        $contents[] = $userTurn;

        return $contents;
    }

    /**
     * Build Gemini conversation history from recent session messages.
     * Pass $excludeMessageId to omit a specific message (e.g. the user message just saved for streaming).
     */
    public static function buildHistory(
        AiCopilotSession         $session,
        AiCopilotMessageRepository $repo,
        int                      $window         = self::HISTORY_WINDOW,
        ?int                     $excludeMessageId = null,
    ): array {
        return $repo->recentBySession($session->id, $window)
            ->filter(fn (AiCopilotMessage $m) => $excludeMessageId === null || $m->id !== $excludeMessageId)
            ->map(fn (AiCopilotMessage $msg) => [
                'role'  => $msg->role === AiCopilotMessageRoleEnum::ASSISTANT ? 'model' : 'user',
                'parts' => [['text' => $msg->content]],
            ])
            ->values()
            ->toArray();
    }

    /**
     * Strip markdown code fences from a Gemini JSON response.
     * Gemini occasionally wraps JSON in ```json ... ``` even when asked not to.
     */
    public static function cleanJsonResponse(string $raw): string
    {
        $clean = (string) preg_replace('/^```(?:json)?\s*/m', '', $raw);
        $clean = (string) preg_replace('/```\s*$/m', '', $clean);

        return trim($clean);
    }

    protected function defaultFollowUpChips(string $intentValue): array
    {
        return match ($intentValue) {
            'write_caption'    => ['Make it shorter', 'Make it more viral', 'Generate hashtags', 'Suggest a CTA'],
            'write_title'      => ['Make it punchier', 'Write a description', 'Generate hashtags'],
            'generate_hashtags' => ['Write a caption', 'Analyze viral potential', 'Suggest niche hashtags'],
            'analyze_viral'    => ['How to improve?', 'Analyze retention', 'Write a better caption', 'Suggest CTA'],
            'analyze_hook'     => ['Rewrite the hook', 'Analyze retention', 'Write full caption'],
            'analyze_frame'    => ['Evaluate the lighting', 'Check composition', 'Write a caption for this frame'],
            default            => ['Write a caption', 'Generate hashtags', 'Analyze viral potential', 'Get general advice'],
        };
    }

    private static function formatTime(?float $seconds): string
    {
        if ($seconds === null) {
            return '?';
        }

        return sprintf('%02d:%02d', (int) floor($seconds / 60), (int) ($seconds % 60));
    }
}
