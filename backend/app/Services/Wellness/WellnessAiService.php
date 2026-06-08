<?php

namespace App\Services\Wellness;

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
