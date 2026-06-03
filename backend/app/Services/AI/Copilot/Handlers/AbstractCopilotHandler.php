<?php

namespace App\Services\AI\Copilot\Handlers;

use App\DTOs\AI\AiCopilotMessageInput;
use App\DTOs\AI\AiCopilotSessionContext;
use App\Models\AiPromptTemplate;
use App\Services\AI\GeminiAiService;

abstract class AbstractCopilotHandler
{
    public function __construct(
        protected readonly GeminiAiService $gemini,
    ) {}

    protected function buildSystemPrompt(AiPromptTemplate $template, AiCopilotSessionContext $context): string
    {
        $contextBlock = $context->toPromptContext();

        $prompt = $template->system_prompt;

        if ($contextBlock) {
            $prompt .= "\n\n## Video Context\n{$contextBlock}";
        }

        return $prompt;
    }

    protected function buildUserTurn(
        AiCopilotMessageInput $input,
        AiPromptTemplate $template,
    ): array {
        $parts = [];

        // Frames come first so the model sees them before the text
        if ($input->hasFrames()) {
            foreach ($input->frames as $frame) {
                // Strip data URI prefix if present
                $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $frame);
                $parts[] = [
                    'inlineData' => [
                        'mimeType' => 'image/png',
                        'data'     => $base64,
                    ],
                ];
            }
        }

        $text = $input->content;

        if ($input->hasTimeline()) {
            $text .= sprintf(
                "\n\n[User selected video segment: %s – %s]",
                $this->formatTime($input->timelineStart),
                $this->formatTime($input->timelineEnd)
            );
        }

        // Apply user_template substitutions if a template placeholder exists
        if ($template->user_template && str_contains($template->user_template, '{{user_message}}')) {
            $text = str_replace('{{user_message}}', $text, $template->user_template);
        }

        $parts[] = ['text' => $text];

        return ['role' => 'user', 'parts' => $parts];
    }

    protected function buildContents(array $history, array $userTurn): array
    {
        $contents   = array_values($history);
        $contents[] = $userTurn;

        return $contents;
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

    private function formatTime(?float $seconds): string
    {
        if ($seconds === null) {
            return '?';
        }
        $m = (int) floor($seconds / 60);
        $s = (int) ($seconds % 60);

        return sprintf('%02d:%02d', $m, $s);
    }
}
