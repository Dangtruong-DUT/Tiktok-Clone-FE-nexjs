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
    public function detect(string $userMessage, array $conversationHistory = []): array
    {
        $template = AiPromptTemplate::forIntent(self::DETECTION_INTENT);

        $systemPrompt = $template?->system_prompt ?? $this->defaultSystemPrompt();
        $userPrompt   = $this->buildUserPrompt($userMessage, $template?->user_template);

        try {
            $result = $this->gemini->generateWithHistory(
                systemPrompt: $systemPrompt,
                contents:     [['role' => 'user', 'parts' => [['text' => $userPrompt]]]],
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
            Log::channel('ai')->warning('Intent detection failed, falling back to general_advice', [
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

    private function buildUserPrompt(string $message, ?string $template): string
    {
        if ($template) {
            return str_replace('{{user_message}}', $message, $template);
        }

        return "User message: \"{$message}\"\n\nRespond with JSON only.";
    }

    private function defaultSystemPrompt(): string
    {
        $intents = implode(', ', array_column(AiCopilotIntentEnum::cases(), 'value'));

        return <<<PROMPT
You are an intent classification system for a TikTok-style creator copilot.

Available intents: {$intents}

Given a user message, respond with a JSON object:
{
  "intent": "<one of the available intents>",
  "confidence": <float between 0 and 1>
}

Rules:
- "write_caption" when user asks for caption, caption ideas, post text
- "write_title" when user asks for a title
- "write_description" when user asks for a description
- "generate_hashtags" when user asks for hashtags, tags
- "rewrite_content" when user asks to rewrite, improve, or rephrase existing text
- "analyze_video" when user asks for general video analysis or review
- "analyze_viral" when user asks about viral potential, virality, trending
- "analyze_retention" when user asks about retention, watch time, audience drop-off
- "analyze_hook" when user asks about the hook, intro, opening
- "analyze_cta" when user asks about call-to-action effectiveness
- "analyze_audience" when user asks about target audience, demographic fit
- "analyze_frame" when user provides frames/screenshots and asks for visual evaluation
- "suggest_cta" when user asks you to write a call-to-action
- "general_advice" for general questions, advice, strategy, growth tips
- "clarification" when the message is unclear and you need more information

Respond with ONLY the JSON object.
PROMPT;
    }
}
