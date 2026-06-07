<?php

namespace App\Services;

use App\Contracts\AI\GeminiClientInterface;
use App\DTOs\AI\Gemini\GeminiConfig;
use App\DTOs\AI\Gemini\GeminiRequest;
use App\Models\AiStudioSetting;

class WellnessAiService
{
    /**
     * Create a new service instance.
     *
     * @param  GeminiClientInterface  $gemini
     */
    public function __construct(
        private readonly GeminiClientInterface $gemini,
    ) {}

    /**
     * Parse natural language wellness rule text into structured JSON preview.
     * Does NOT save — returns preview for user confirmation.
     *
     * @return array{type: string, conditions: array, action: string, title: string, message: string, confidence: float}
     */
    public function parseRule(string $nlText): array
    {
        $result = $this->generateJson(
            $this->wellnessRuleParserSystem(),
            "Parse this wellness rule request: \"{$nlText}\"",
            ['type', 'conditions', 'action', 'title', 'message'],
        );

        $data = $result['data'];

        return [
            'type'       => (string) ($data['type']       ?? 'continuous_usage'),
            'conditions' => (array)  ($data['conditions'] ?? ['minutes' => 60]),
            'action'     => (string) ($data['action']     ?? 'warning'),
            'title'      => (string) ($data['title']      ?? ''),
            'message'    => (string) ($data['message']    ?? ''),
            'confidence' => (float)  max(0, min(1, $data['confidence'] ?? 0.5)),
        ];
    }

    /**
     * Analyze user usage statistics and return behavioral insights + suggested rules.
     *
     * @param  array<string,mixed>  $stats
     * @return array{summary: string, patterns: string[], concerns: string[], recommendations: string[], suggested_rules: array[]}
     */
    public function analyzeUsage(array $stats): array
    {
        $statsJson = json_encode($stats, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        $result = $this->generateJson(
            $this->wellnessAnalysisSystem(),
            "Analyze these usage statistics and provide wellness insights:\n\n{$statsJson}",
            ['summary', 'patterns', 'recommendations'],
        );

        $data = $result['data'];

        return [
            'summary'         => (string) ($data['summary']         ?? ''),
            'patterns'        => array_values(array_filter((array) ($data['patterns']        ?? []))),
            'concerns'        => array_values(array_filter((array) ($data['concerns']        ?? []))),
            'recommendations' => array_values(array_filter((array) ($data['recommendations'] ?? []))),
            'suggested_rules' => array_values(array_filter((array) ($data['suggested_rules'] ?? []))),
        ];
    }

    private function wellnessRuleParserSystem(): string
    {
        return <<<'PROMPT'
You are a wellness rule parser for a screen-time management application. Convert the user's natural language request into a structured wellness rule.

Respond with JSON:
{
  "type": "continuous_usage | daily_limit | video_watch_time | late_night",
  "conditions": { "minutes": <int> } | { "from_hour": <int>, "to_hour": <int> },
  "action": "warning | soft_block",
  "title": "<short rule title>",
  "message": "<friendly notification message>",
  "confidence": <0.0-1.0>
}

Type guide:
- continuous_usage: user has been using the app non-stop for too many minutes → conditions: { "minutes": <int> }
- daily_limit: total daily usage exceeds a threshold → conditions: { "minutes": <int> }
- video_watch_time: video watch time exceeds a threshold → conditions: { "minutes": <int> }
- late_night: usage during late-night hours → conditions: { "from_hour": 22, "to_hour": 6 }

Action guide:
- warning: show a warning notification
- soft_block: require user confirmation to continue
PROMPT;
    }

    private function wellnessAnalysisSystem(): string
    {
        return <<<'PROMPT'
You are a digital wellness coach. Analyze the user's screen-time statistics and provide actionable insights.

Respond with JSON:
{
  "summary": "<1-2 sentence overview>",
  "patterns": ["<pattern 1>", ...],
  "concerns": ["<concern 1>", ...],
  "recommendations": ["<recommendation 1>", ...],
  "suggested_rules": [
    { "type": "...", "conditions": {...}, "action": "...", "title": "...", "message": "..." }
  ]
}
PROMPT;
    }

    /**
     * @param  array<string>  $requiredKeys
     * @return array{data: array<string,mixed>, token_usage: array<string,int>}
     */
    private function generateJson(string $systemPrompt, string $userPrompt, array $requiredKeys = []): array
    {
        $result = $this->gemini->send(new GeminiRequest(
            systemPrompt: $systemPrompt,
            contents:     [['role' => 'user', 'parts' => [['text' => $userPrompt]]]],
            config:       GeminiConfig::fromSetting(AiStudioSetting::current(), [
                'responseMimeType' => 'application/json',
            ]),
        ))->toArray();

        $clean = (string) preg_replace('/^```(?:json)?\s*/m', '', $result['text']);
        $clean = (string) preg_replace('/```\s*$/m', '', $clean);
        $clean = trim($clean);

        $data = json_decode($clean, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException('Gemini returned invalid JSON: ' . json_last_error_msg());
        }

        foreach ($requiredKeys as $key) {
            if (! array_key_exists($key, $data)) {
                throw new \RuntimeException("Missing required field in AI response: {$key}");
            }
        }

        return ['data' => $data, 'token_usage' => $result['token_usage']];
    }
}
