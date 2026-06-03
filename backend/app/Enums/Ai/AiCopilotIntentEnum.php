<?php

namespace App\Enums\Ai;

enum AiCopilotIntentEnum: string
{
    case WRITE_CAPTION      = 'write_caption';
    case WRITE_TITLE        = 'write_title';
    case WRITE_DESCRIPTION  = 'write_description';
    case GENERATE_HASHTAGS  = 'generate_hashtags';
    case REWRITE_CONTENT    = 'rewrite_content';
    case ANALYZE_VIDEO      = 'analyze_video';
    case ANALYZE_VIRAL      = 'analyze_viral';
    case ANALYZE_RETENTION  = 'analyze_retention';
    case ANALYZE_HOOK       = 'analyze_hook';
    case ANALYZE_CTA        = 'analyze_cta';
    case ANALYZE_AUDIENCE   = 'analyze_audience';
    case ANALYZE_FRAME      = 'analyze_frame';
    case SUGGEST_CTA        = 'suggest_cta';
    case SCHEDULE_POST      = 'schedule_post';
    case GENERAL_ADVICE     = 'general_advice';
    case CLARIFICATION      = 'clarification';

    public function isGenerative(): bool
    {
        return in_array($this, [
            self::WRITE_CAPTION,
            self::WRITE_TITLE,
            self::WRITE_DESCRIPTION,
            self::GENERATE_HASHTAGS,
            self::REWRITE_CONTENT,
            self::SUGGEST_CTA,
        ]);
    }

    public function targetFormField(): ?string
    {
        return match ($this) {
            self::WRITE_CAPTION,
            self::REWRITE_CONTENT    => 'content',
            self::WRITE_TITLE        => 'title',
            self::WRITE_DESCRIPTION  => 'description',
            self::GENERATE_HASHTAGS  => 'hashtags',
            self::SUGGEST_CTA        => 'content',
            default                  => null,
        };
    }
}
