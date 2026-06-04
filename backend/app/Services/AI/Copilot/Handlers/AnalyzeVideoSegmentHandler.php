<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\DTOs\AI\CopilotHandlerResult;
use App\Enums\Ai\AiCopilotIntentEnum;
use App\Models\AiPromptTemplate;

class AnalyzeVideoSegmentHandler extends AbstractCopilotHandler implements CopilotHandlerInterface
{
    private const FALLBACK_SYSTEM_PROMPT = <<<'PROMPT'
You are an expert video content analyst for short-form social media (TikTok, Reels, Shorts).
The user will provide keyframes from a selected video segment, plus the time range of that segment.

Analyze the provided segment and respond in the same language the user writes in.
Structure your response with exactly these sections (use markdown headers):

## Content Analysis
What is happening in this segment? What message or story is being told?

## Audience
Who is the target audience? Does the content match them?

## Engagement Prediction
Estimate retention likelihood for this segment. Identify hooks or drop-off risks.

## Improvement Suggestions
Concrete, actionable suggestions for hook, visuals, audio, pacing, and CTA.

## Viral Opportunities
Relevant trends, sounds, formats, or hashtag angles this segment could leverage.

Be concise, specific, and actionable. Avoid generic advice.
PROMPT;

    public function handle(
        AiCopilotIntentEnum     $intent,
        AiCopilotMessageInput   $input,
        AiCopilotSessionContext $context,
        AiPromptTemplate        $template,
        array                   $conversationHistory,
    ): CopilotHandlerResult {
        $startedAt = hrtime(true);

        $systemPrompt = $template->system_prompt
            ? $this->buildSystemPrompt($template, $context)
            : self::FALLBACK_SYSTEM_PROMPT . ($context->toPromptContext() ? "\n\n## Video Context\n" . $context->toPromptContext() : '');

        $userTurn  = $this->buildUserTurn($input, $template);
        $contents  = $this->buildContents($conversationHistory, $userTurn);

        $result = $this->gemini->generateWithHistory(
            systemPrompt: $systemPrompt,
            contents:     $contents,
        );

        $latencyMs = (int) round((hrtime(true) - $startedAt) / 1_000_000);

        return new CopilotHandlerResult(
            text:             $result['text'],
            structuredOutput: null,
            followUpChips:    ['Analyze the hook', 'Write a caption', 'Suggest improvements', 'Generate hashtags'],
            targetField:      null,
            tokenUsage:       $result['token_usage'],
            latencyMs:        $latencyMs,
        );
    }
}
