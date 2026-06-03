<?php

namespace App\Services;

use App\Services\AI\AiPromptBuilderService;
use App\Services\AI\GeminiAiService;

class WellnessAiService
{
    public function __construct(
        private readonly GeminiAiService       $gemini,
        private readonly AiPromptBuilderService $promptBuilder,
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
            $this->promptBuilder->wellnessRuleParserSystem(),
            $this->promptBuilder->wellnessRuleParserUser($nlText),
            ['type', 'conditions', 'action', 'title', 'message'],
        );

        $data = $result['data'];

        return [
            'type'       => (string) ($data['type']    ?? 'continuous_usage'),
            'conditions' => (array)  ($data['conditions'] ?? ['minutes' => 60]),
            'action'     => (string) ($data['action']  ?? 'warning'),
            'title'      => (string) ($data['title']   ?? ''),
            'message'    => (string) ($data['message'] ?? ''),
            'confidence' => (float)  max(0, min(1, $data['confidence'] ?? 0.5)),
        ];
    }

    /**
     * Analyze user usage statistics and return behavioral insights + suggested rules.
     *
     * @param  array<string,mixed>  $stats  Output from ScreenTimeTrackingService::getStats()
     * @return array{summary: string, patterns: string[], concerns: string[], recommendations: string[], suggested_rules: array[]}
     */
    public function analyzeUsage(array $stats): array
    {
        $result = $this->gemini->generateJson(
            $this->promptBuilder->wellnessAnalysisSystem(),
            $this->promptBuilder->wellnessAnalysisUser($stats),
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
}
