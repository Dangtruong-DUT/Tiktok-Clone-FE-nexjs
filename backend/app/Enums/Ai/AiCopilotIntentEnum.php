<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum AiCopilotIntentEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case WRITE_CAPTION        = 'write_caption';
    case WRITE_TITLE          = 'write_title';
    case WRITE_DESCRIPTION    = 'write_description';
    case GENERATE_HASHTAGS    = 'generate_hashtags';
    case REWRITE_CONTENT      = 'rewrite_content';
    case ANALYZE_VIDEO        = 'analyze_video';
    case ANALYZE_VIRAL        = 'analyze_viral';
    case ANALYZE_RETENTION    = 'analyze_retention';
    case ANALYZE_HOOK         = 'analyze_hook';
    case ANALYZE_CTA          = 'analyze_cta';
    case ANALYZE_AUDIENCE     = 'analyze_audience';
    case ANALYZE_FRAME        = 'analyze_frame';
    case ANALYZE_VIDEO_SEGMENT = 'analyze_video_segment';
    case SUGGEST_CTA          = 'suggest_cta';
    case SCHEDULE_POST        = 'schedule_post';
    case GENERAL_ADVICE       = 'general_advice';
    case CLARIFICATION        = 'clarification';

    /**
     * Get the label of the enum value.
     */
    public function label(): string
    {
        return match ($this) {
            self::WRITE_CAPTION         => 'Write Caption',
            self::WRITE_TITLE           => 'Write Title',
            self::WRITE_DESCRIPTION     => 'Write Description',
            self::GENERATE_HASHTAGS     => 'Generate Hashtags',
            self::REWRITE_CONTENT       => 'Rewrite Content',
            self::ANALYZE_VIDEO         => 'Analyze Video',
            self::ANALYZE_VIRAL         => 'Analyze Viral',
            self::ANALYZE_RETENTION     => 'Analyze Retention',
            self::ANALYZE_HOOK          => 'Analyze Hook',
            self::ANALYZE_CTA           => 'Analyze CTA',
            self::ANALYZE_AUDIENCE      => 'Analyze Audience',
            self::ANALYZE_FRAME         => 'Analyze Frame',
            self::ANALYZE_VIDEO_SEGMENT => 'Analyze Video Segment',
            self::SUGGEST_CTA           => 'Suggest CTA',
            self::SCHEDULE_POST         => 'Schedule Post',
            self::GENERAL_ADVICE        => 'General Advice',
            self::CLARIFICATION         => 'Clarification',
        };
    }

    /**
     * Get the translated label of the enum value.
     */
    public function translate(): string
    {
        return match ($this) {
            self::WRITE_CAPTION         => 'Viết Caption',
            self::WRITE_TITLE           => 'Viết Tiêu đề',
            self::WRITE_DESCRIPTION     => 'Viết Mô tả',
            self::GENERATE_HASHTAGS     => 'Tạo Hashtag',
            self::REWRITE_CONTENT       => 'Viết lại nội dung',
            self::ANALYZE_VIDEO         => 'Phân tích Video',
            self::ANALYZE_VIRAL         => 'Phân tích Viral',
            self::ANALYZE_RETENTION     => 'Phân tích Retention',
            self::ANALYZE_HOOK          => 'Phân tích Hook',
            self::ANALYZE_CTA           => 'Phân tích CTA',
            self::ANALYZE_AUDIENCE      => 'Phân tích Đối tượng',
            self::ANALYZE_FRAME         => 'Phân tích Khung hình',
            self::ANALYZE_VIDEO_SEGMENT => 'Phân tích Đoạn video',
            self::SUGGEST_CTA           => 'Đề xuất CTA',
            self::SCHEDULE_POST         => 'Lên lịch đăng',
            self::GENERAL_ADVICE        => 'Tư vấn chung',
            self::CLARIFICATION         => 'Làm rõ',
        };
    }

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
