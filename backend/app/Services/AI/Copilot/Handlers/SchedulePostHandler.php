<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;
use Carbon\Carbon;

/**
 * Parses natural-language scheduling requests and returns a schedule_card
 * structured output for the user to confirm before the schedule API is called.
 *
 * No post is actually scheduled here — the frontend calls
 * POST /studio/posts/{uuid}/schedule upon Accept.
 */
class SchedulePostHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    public function handle(
        AiCopilotIntentEnum    $intent,
        AiCopilotMessageInput  $input,
        AiCopilotSessionContext $context,
        AiPromptTemplate       $template,
        array                  $conversationHistory,
    ): CopilotHandlerResult {
        if (empty($context->postUuid)) {
            return new CopilotHandlerResult(
                text: 'Bạn cần lưu bài đăng trước khi lên lịch. Hãy nhấn "Lưu nháp" hoặc hoàn tất bài đăng, sau đó tôi có thể giúp lên lịch.',
                structuredOutput: null,
                followUpChips: ['Write a caption', 'Generate hashtags', 'Analyze viral potential'],
                targetField: null,
            );
        }

        $startedAt    = hrtime(true);
        $systemPrompt = $template->system_prompt;
        $userText     = $input->content;

        $nowVn = Carbon::now('Asia/Ho_Chi_Minh');
        $systemPrompt .= "\n\nCurrent time (Vietnam): {$nowVn->format('l, d/m/Y H:i')} (UTC+7).";

        $result = $this->gemini->generateWithHistory(
            systemPrompt: $systemPrompt,
            contents:     [['role' => 'user', 'parts' => [['text' => $userText]]]],
            config:       [
                'responseMimeType' => 'application/json',
                'temperature'      => 0.1,
                'maxOutputTokens'  => 200,
            ],
        );

        $latencyMs = (int) round((hrtime(true) - $startedAt) / 1_000_000);

        $data = json_decode(self::cleanJsonResponse($result['text']), true) ?? [];

        if (empty($data['scheduled_at'])) {
            return new CopilotHandlerResult(
                text: 'Tôi không hiểu rõ thời gian bạn muốn. Bạn có thể nói rõ hơn không? Ví dụ: "Lên lịch vào 8 giờ tối thứ 6 tuần này".',
                structuredOutput: null,
                followUpChips: ['Schedule for tomorrow 8pm', 'Schedule for Friday 8pm', 'Schedule for Monday morning'],
                targetField: null,
                tokenUsage: $result['token_usage'],
                latencyMs:  $latencyMs,
            );
        }

        $humanReadable = $data['human_readable'] ?? $data['scheduled_at'];
        $isPast        = Carbon::parse($data['scheduled_at'])->isPast();

        if ($isPast) {
            return new CopilotHandlerResult(
                text: "Thời gian \"{$humanReadable}\" đã qua. Vui lòng chọn thời gian trong tương lai.",
                structuredOutput: null,
                followUpChips: ['Schedule for tomorrow 8pm', 'Schedule for Friday 8pm'],
                targetField: null,
                tokenUsage: $result['token_usage'],
                latencyMs:  $latencyMs,
            );
        }

        $timezone = $this->normalizeTimezone($data['timezone'] ?? null);

        $structuredOutput = [
            'type'           => 'schedule_card',
            'post_uuid'      => $context->postUuid,
            'scheduled_at'   => $data['scheduled_at'],         // ISO-8601 UTC
            'timezone'       => $timezone,
            'human_readable' => $humanReadable,
            'confidence'     => (float) ($data['confidence'] ?? 0.9),
        ];

        return new CopilotHandlerResult(
            text:             "Tôi đề xuất lên lịch đăng bài vào **{$humanReadable}**.",
            structuredOutput: $structuredOutput,
            followUpChips:    ['Change the time', 'Write a caption first', 'Analyze viral potential'],
            targetField:      null,
            tokenUsage:       $result['token_usage'],
            latencyMs:        $latencyMs,
        );
    }

    private function normalizeTimezone(?string $tz): string
    {
        $default = 'Asia/Ho_Chi_Minh';

        if (! $tz) {
            return $default;
        }

        if (in_array($tz, \DateTimeZone::listIdentifiers(), true)) {
            return $tz;
        }

        $offsetMap = [
            'UTC+7'  => 'Asia/Ho_Chi_Minh',
            'GMT+7'  => 'Asia/Ho_Chi_Minh',
            '+07:00' => 'Asia/Ho_Chi_Minh',
            'UTC+8'  => 'Asia/Singapore',
            'GMT+8'  => 'Asia/Singapore',
            '+08:00' => 'Asia/Singapore',
            'UTC+0'  => 'UTC',
            'GMT'    => 'UTC',
        ];

        return $offsetMap[$tz] ?? $default;
    }
}
