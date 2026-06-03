<?php

namespace App\Services;

use App\Services\AI\GeminiAiService;

class WellnessAiService
{
    public function __construct(
        private readonly GeminiAiService $gemini,
    ) {}

    /**
     * Parse natural language wellness rule text into structured JSON preview.
     * Does NOT save — returns preview for user confirmation.
     *
     * @return array{type: string, conditions: array, action: string, title: string, message: string, confidence: float}
     */
    public function parseRule(string $nlText): array
    {
        $result = $this->gemini->generateJson(
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

        $result = $this->gemini->generateJson(
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
  "type": "continuous_usage | daily_limit | session_count",
  "conditions": { "minutes": <int> } | { "daily_minutes": <int> } | { "sessions": <int> },
  "action": "warning | lock | reminder",
  "title": "<short rule title>",
  "message": "<friendly notification message>",
  "confidence": <0.0-1.0>
}
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
}
