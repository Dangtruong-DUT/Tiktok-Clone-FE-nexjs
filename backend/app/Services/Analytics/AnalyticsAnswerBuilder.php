<?php

namespace App\Services\Analytics;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\Gemini\GeminiConfig;
use App\DTOs\AI\Gemini\GeminiRequest;
use App\Repositories\AiStudioSettingRepository;
use App\Repositories\AiPromptTemplateRepository;
use Illuminate\Support\Facades\Log;

/**
 * Synthesizes analytics tool results into a natural language insight via Gemini.
 * Uses the 'analytics_answer_builder' prompt template.
 */
class AnalyticsAnswerBuilder
{
    private const BUILDER_INTENT = 'analytics_answer_builder';

    /**
     * @param  GeminiClientInterface      $gemini
     * @param  AiPromptTemplateRepository $templateRepo
     */
    public function __construct(
        private readonly GeminiClientInterface      $gemini,
        private readonly AiPromptTemplateRepository $templateRepo,
        private readonly AiStudioSettingRepository  $settingRepository,
    ) {}

    /**
     * Build a natural language analysis from raw tool results.
     *
     * @param  string  $question      Original user question
     * @param  array<string, array<string,mixed>>  $toolResults  From ToolExecutor
     * @param  string  $responseView  Suggested view from Planner
     * @param  string  $locale        User locale ('vi' | 'en')
     * @return array{text: string, response_view: string, tool_results: array<string,mixed>, follow_up_chips: list<string>}
     */
    public function build(
        string $question,
        array  $toolResults,
        string $responseView,
        string $locale,
    ): array {
        $template     = $this->templateRepo->findByIntent(self::BUILDER_INTENT);
        $systemPrompt = $template?->system_prompt ?? $this->defaultSystemPrompt($locale);
        $userPrompt   = $this->buildUserPrompt($question, $toolResults, $responseView, $locale, $template?->user_template);

        try {
            $result = $this->gemini->send(new GeminiRequest(
                systemPrompt: $systemPrompt,
                contents:     [['role' => 'user', 'parts' => [['text' => $userPrompt]]]],
                config:       GeminiConfig::fromSetting($this->settingRepository->current(), [
                    'temperature'      => 0.3,
                    'maxOutputTokens'  => 15000,
                    'responseMimeType' => 'application/json',
                ]),
            ))->toArray();

            $payload = $this->parseJsonPayload((string) ($result['text'] ?? ''));
            $text    = trim((string) ($payload['text'] ?? $result['text'] ?? ''));

            return [
                'text'             => $text ?: $this->fallbackText($toolResults, $locale),
                'response_view'    => (string) ($payload['response_view'] ?? $responseView),
                'tool_results'     => $toolResults,
                'follow_up_chips'  => $this->normalizeChips($payload['follow_up_chips'] ?? null, $toolResults, $locale),
            ];
        } catch (\Throwable $e) {
            Log::channel(config('ai.logging.channel', 'stack'))->warning('AnalyticsAnswerBuilder failed, using raw fallback', [
                'error' => $e->getMessage(),
            ]);

            return [
                'text'            => $this->fallbackText($toolResults, $locale),
                'response_view'   => $responseView,
                'tool_results'    => $toolResults,
                'follow_up_chips' => $this->deriveFollowUpChips($toolResults, $locale),
            ];
        }
    }

    /**
     * Build the user-turn prompt by injecting tool results and question.
     *
     * @param  string  $question
     * @param  array<string, array<string,mixed>>  $toolResults
     * @param  string  $responseView
     * @param  string|null  $userTemplate
     * @return string
     */
    private function buildUserPrompt(
        string  $question,
        array   $toolResults,
        string  $responseView,
        string  $locale,
        ?string $userTemplate,
    ): string {
        $dataJson = json_encode($toolResults, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        if ($userTemplate) {
            return str_replace(
                [
                    '{{question}}',
                    '{{data}}',
                    '{{user_message}}',
                    '{{locale}}',
                    '{{tool_results}}',
                    '{{response_view}}',
                ],
                [
                    $question,
                    (string) $dataJson,
                    $question,
                    $locale,
                    (string) $dataJson,
                    $responseView,
                ],
                $userTemplate
            );
        }

        return <<<PROMPT
User question: "{$question}"
Response view: {$responseView}

Data:
{$dataJson}

Analyze the data and provide a concise, insightful response.
PROMPT;
    }

    /**
     * Build a minimal text fallback when Gemini call fails.
     *
     * @param  array<string, array<string,mixed>>  $toolResults
     * @param  string  $locale
     * @return string
     */
    private function fallbackText(array $toolResults, string $locale): string
    {
        $isVi = str_starts_with($locale, 'vi');
        $count = count($toolResults);

        if ($isVi) {
            return "Đã lấy dữ liệu từ {$count} nguồn thống kê. Vui lòng xem chi tiết trong kết quả bên dưới.";
        }

        return "Retrieved data from {$count} analytics source(s). See the results below for details.";
    }

    /**
     * @return array<string,mixed>
     */
    private function parseJsonPayload(string $raw): array
    {
        $clean = (string) preg_replace('/^```(?:json)?\s*/m', '', $raw);
        $clean = (string) preg_replace('/```\s*$/m', '', trim($clean));
        $data  = json_decode($clean, true);

        return is_array($data) ? $data : [];
    }

    /**
     * @return list<string>
     */
    private function normalizeChips(mixed $chips, array $toolResults, string $locale): array
    {
        if (is_array($chips)) {
            $normalized = array_values(array_filter($chips, fn (mixed $chip) => is_string($chip) && $chip !== ''));

            if ($normalized !== []) {
                return $normalized;
            }
        }

        return $this->deriveFollowUpChips($toolResults, $locale);
    }

    /**
     * Derive contextual follow-up chips based on what tools were run.
     *
     * @param  array<string, array<string,mixed>>  $toolResults
     * @param  string  $locale
     * @return list<string>
     */
    private function deriveFollowUpChips(array $toolResults, string $locale): array
    {
        $tools = array_keys($toolResults);

        $chipKey = match (true) {
            array_intersect(['get_encoding_queue_status', 'get_queue_failure_stats'], $tools) !== []
                                                                      => 'analytics_encoding',
            in_array('get_system_health', $tools, true)              => 'analytics_system_health',
            in_array('get_admin_audit_logs', $tools, true)           => 'analytics_audit',
            in_array('get_top_creators', $tools, true)               => 'analytics_top_creators',
            in_array('get_ai_copilot_metrics', $tools, true)         => 'analytics_ai_copilot',
            in_array('get_account_overview', $tools, true)          => 'analytics_account_overview',
            array_intersect(['get_appeal_overview', 'get_appeal_sla_metrics'], $tools) !== []
                                                                      => 'analytics_appeals',
            in_array('get_active_user_trend', $tools, true)          => 'analytics_active_users',
            in_array('get_user_growth', $tools, true)                => 'analytics_user_growth',
            in_array('get_scheduled_post_metrics', $tools, true)     => 'analytics_scheduled',
            in_array('get_ai_studio_metrics', $tools, true)          => 'analytics_ai_studio',
            in_array('get_comment_overview', $tools, true)           => 'analytics_comments',
            in_array('get_top_videos', $tools, true)                 => 'analytics_top_videos',
            in_array('get_screen_time_overview', $tools, true)       => 'analytics_screen_time',
            in_array('get_follower_growth', $tools, true)            => 'analytics_follower_growth',
            in_array('get_post_engagement_breakdown', $tools, true)  => 'analytics_post_engagement',
            array_intersect(['get_post_overview', 'get_post_status_breakdown'], $tools) !== []
                                                                      => 'analytics_post',
            default                                                   => 'analytics',
        };

        $chips = trans("copilot.chips.{$chipKey}", [], $locale);
        return is_array($chips) ? $chips : (array) trans('copilot.chips.analytics', [], $locale);
    }

    /**
     * @return list<string>
     */
    private function chips(string $key, string $locale): array
    {
        $chips = trans("copilot.chips.{$key}", [], $locale);

        return is_array($chips) ? $chips : [];
    }

    /**
     * Default system prompt when DB template is not yet seeded.
     *
     * @param  string  $locale
     * @return string
     */
    private function defaultSystemPrompt(string $locale): string
    {
        $isVi = str_starts_with($locale, 'vi');

        if ($isVi) {
            return 'Bạn là Snapi Studio AI — chuyên gia phân tích dữ liệu. '
                . 'Tổng hợp dữ liệu analytics được cung cấp thành nhận xét ngắn gọn và có giá trị. '
                . 'Dùng markdown, bao gồm số liệu cụ thể, xu hướng và đề xuất hành động. '
                . 'Trả lời bằng tiếng Việt.';
        }

        return 'You are Snapi Studio AI — a data analytics expert. '
            . 'Synthesize the provided analytics data into concise, actionable insights. '
            . 'Use markdown, include specific numbers, trends, and action recommendations. '
            . 'Reply in English.';
    }
}
