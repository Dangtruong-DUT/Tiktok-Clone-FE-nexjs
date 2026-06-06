<?php

namespace App\Services\AI\Copilot;

use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;
use App\Services\AI\GeminiAiService;
use Illuminate\Support\Facades\Log;

class AiCopilotIntentDetector
{
    private const DETECTION_INTENT = 'intent_detection';
    private const MIN_CONFIDENCE   = 0.40;

    public function __construct(
        private readonly GeminiAiService $gemini,
    ) {}

    /**
     * Detect the user's intent from a message.
     *
     * @return array{intent: AiCopilotIntentEnum, confidence: float, target_field: ?string}
     */
    public function detect(string $userMessage, array $conversationHistory = [], ?string $userRole = null): array
    {
        $template = AiPromptTemplate::forIntent(self::DETECTION_INTENT);

        $systemPrompt = $template?->system_prompt ?? $this->defaultSystemPrompt();
        $userPrompt   = $this->buildUserPrompt($userMessage, $template?->user_template, $userRole);

        // Include last 3 messages of history so Gemini can resolve contextual follow-ups
        // (e.g. "thêm hashtag cho bài đó" refers to previous context).
        $recentHistory = array_slice($conversationHistory, -3);
        $contents      = array_merge($recentHistory, [['role' => 'user', 'parts' => [['text' => $userPrompt]]]]);

        try {
            $result = $this->gemini->generateWithHistory(
                systemPrompt: $systemPrompt,
                contents:     $contents,
                config:       [
                    'temperature'      => 0.1,
                    'maxOutputTokens'  => 150,
                    'responseMimeType' => 'application/json',
                ],
            );

            $clean = (string) preg_replace('/^```(?:json)?\s*/m', '', $result['text']);
            $clean = (string) preg_replace('/```\s*$/m', '', $clean);
            $data  = json_decode(trim($clean), true);

            if (json_last_error() !== JSON_ERROR_NONE || ! isset($data['intent'])) {
                return $this->fallback();
            }

            $intentValue = (string) $data['intent'];
            $confidence  = (float) ($data['confidence'] ?? 0.5);

            $intent = AiCopilotIntentEnum::tryFrom($intentValue);

            if ($intent === null || $confidence < self::MIN_CONFIDENCE) {
                return $this->fallback();
            }

            return [
                'intent'       => $intent,
                'confidence'   => $confidence,
                'target_field' => $intent->targetFormField(),
            ];
        } catch (\Throwable $e) {
            Log::warning('Intent detection failed, falling back to general_advice', [
                'error' => $e->getMessage(),
            ]);

            return $this->fallback();
        }
    }

    private function fallback(): array
    {
        return [
            'intent'       => AiCopilotIntentEnum::GENERAL_ADVICE,
            'confidence'   => 0.0,
            'target_field' => null,
        ];
    }

    private function buildUserPrompt(string $message, ?string $template, ?string $userRole = null): string
    {
        $roleHint = $userRole ? "\nUser role: {$userRole}" : '';

        if ($template) {
            $result = str_replace('{{user_message}}', $message, $template);
            return $result . $roleHint;
        }

        return "User message: \"{$message}\"{$roleHint}\n\nRespond with JSON only.";
    }

    private function defaultSystemPrompt(): string
    {
        $intents = implode(', ', array_column(AiCopilotIntentEnum::cases(), 'value'));

        return <<<PROMPT
You are an intent classification system for Snapi Studio — a short-form video creation and management platform.
This system ONLY serves Snapi Studio. Never ask "which platform?" — always assume Snapi Studio.

Available intents: {$intents}

Given a user message and optional user role, respond with a JSON object:
{
  "intent": "<one of the available intents>",
  "confidence": <float between 0 and 1>
}

Rules:

DATA QUERY intents (route here before content generation):
- "query_user_stats": user asks about THEIR OWN account — followers, posts, likes, profile, appeals. Signals: "của tôi", "tài khoản tôi", "my account", "my stats", "my profile"
- "query_post_stats": user asks about performance of THEIR OWN posts — views, likes, comments, best/worst posts
- "query_screen_time": user asks about their own screen time, usage duration, "thời gian sử dụng", "xem bao lâu"
- "query_app_info": user asks how Snapi Studio features work, what something is, "snapi là gì", "tính năng X hoạt động thế nào"
- "navigate_to": user wants to open or go to a specific page/section of the app: "mở", "đến", "go to", "open", "navigate to"
- "query_notifications": user asks about THEIR OWN notifications — unread count, what happened today, who liked/followed/mentioned them. Signals: "thông báo", "notification", "unread", "chưa đọc", "ai like", "ai follow"
- "admin_query_stats": ONLY for super_admin — general platform overview: total users, growth, content counts, engagement totals, system health. Signals: "thống kê hệ thống", "tổng quan", "dashboard", "platform stats", "system stats". ONLY use if user_role = super_admin.
- "admin_query_appeals": ONLY for super_admin — asking specifically about appeals: pending counts, breakdown by type, oldest appeal, approval rates. Signals: "kháng cáo chờ", "pending appeals", "appeal list", "danh sách kháng cáo". ONLY use if user_role = super_admin.
- "admin_query_ai_metrics": ONLY for super_admin — asking specifically about AI costs, usage, top intents, top users by cost. Signals: "chi phí ai", "ai costs", "top intent", "copilot usage", "ai spending", "ai metrics". ONLY use if user_role = super_admin.
- "admin_query_encoding": ONLY for super_admin — asking specifically about video encoding queue, failures, stuck jobs. Signals: "video lỗi encoding", "encoding errors", "encoding queue", "video lỗi mã hoá". ONLY use if user_role = super_admin.

ROLE DISAMBIGUATION:
- If user_role = super_admin and asks about appeals specifically → "admin_query_appeals"
- If user_role = super_admin and asks about AI costs/usage specifically → "admin_query_ai_metrics"
- If user_role = super_admin and asks about video encoding → "admin_query_encoding"
- If user_role = super_admin and asks general platform overview → "admin_query_stats"
- If user_role = super_admin and message uses "của tôi", "my account" → "query_user_stats" (admin's own account)
- If user_role is not super_admin and message asks about "số người dùng" → "query_user_stats" (their own followers)

CONTENT GENERATION intents:
- "schedule_post": user wants to schedule a publish time: "lên lịch", "đăng vào", "post at", "schedule for"
- "write_caption": user asks to WRITE a caption/post text
- "write_title": user asks to write a title
- "write_description": user asks to write a description
- "generate_hashtags": user asks for hashtags
- "rewrite_content": user asks to rewrite, improve, or rephrase existing text
- "suggest_cta": user asks for a call-to-action

ANALYSIS intents:
- "analyze_video": general video review or feedback
- "analyze_viral": viral potential, virality, trending
- "analyze_retention": retention, watch time, audience drop-off
- "analyze_hook": opening hook or intro
- "analyze_cta": call-to-action effectiveness
- "analyze_audience": target audience or demographic fit
- "analyze_frame": user provides image frames for visual evaluation
- "analyze_video_segment": user asks to analyze a specific time segment (with frames + time range)

FALLBACK:
- "general_advice": general questions, advice, strategy, tips not covered above
- "clarification": message is too vague or ambiguous to classify

IMPORTANT: Always prefer data-query intents over content-generation intents when user is asking a question about existing data.

BIAS RULES — apply these BEFORE defaulting to general_advice:
- If message contains "của tôi", "tôi có", "tôi đang", "tài khoản tôi" AND mentions stats/data/count → prefer "query_user_stats" (confidence ≥ 0.80)
- If message contains "screen time", "thời gian sử dụng", "phân tích screen time", "thời gian dùng app", "thời gian online" → prefer "query_screen_time" (confidence ≥ 0.85)
- If message contains "bài đăng của tôi", "video của tôi", "post của tôi" AND asking about count/performance → prefer "query_post_stats" (confidence ≥ 0.80)
- NEVER return "general_advice" with confidence > 0.70 if a query_* intent is plausible — prefer the specific query intent.

Respond with ONLY the JSON object.
PROMPT;
    }
}
