<?php

namespace App\Enums\Ai;

use App\Enums\BaseEnumInterface;
use App\Enums\BaseEnumTrait;

enum AiConversationStepEnum: string implements BaseEnumInterface
{
    use BaseEnumTrait;

    case TOPIC    = 'topic';
    case FORMAT   = 'format';
    case AUDIENCE = 'audience';
    case TONE     = 'tone';
    case HOOK     = 'hook';

    /** Ordered step sequence */
    public static function sequence(): array
    {
        return [self::TOPIC, self::FORMAT, self::AUDIENCE, self::TONE, self::HOOK];
    }

    /** Whether this step can be skipped by the user */
    public function isOptional(): bool
    {
        return $this === self::HOOK;
    }

    public function next(): ?self
    {
        $sequence = self::sequence();
        $index    = array_search($this, $sequence, true);

        return $index !== false && isset($sequence[$index + 1]) ? $sequence[$index + 1] : null;
    }

    public function label(): string
    {
        return match ($this) {
            self::TOPIC    => 'Topic',
            self::FORMAT   => 'Format',
            self::AUDIENCE => 'Audience',
            self::TONE     => 'Tone',
            self::HOOK     => 'Hook',
        };
    }

    public function translate(): string
    {
        return match ($this) {
            self::TOPIC    => 'Chủ đề',
            self::FORMAT   => 'Định dạng',
            self::AUDIENCE => 'Đối tượng',
            self::TONE     => 'Giọng điệu',
            self::HOOK     => 'Hook mở đầu',
        };
    }

    /** Returns the AI question text for this step */
    public function question(): string
    {
        return match ($this) {
            self::TOPIC    => 'Video của bạn về chủ đề gì? Mô tả ngắn gọn nội dung bạn muốn tạo.',
            self::FORMAT   => 'Bạn muốn phong cách/format nào cho video?',
            self::AUDIENCE => 'Đối tượng mục tiêu của bạn là ai?',
            self::TONE     => 'Bạn muốn giọng điệu/tone như thế nào?',
            self::HOOK     => 'Bạn có ý tưởng câu mở đầu (hook) nào không? (Bỏ qua nếu chưa có)',
        };
    }

    /** Returns predefined options for steps that have them, or null for free-text steps */
    public function options(): ?array
    {
        return match ($this) {
            self::TOPIC, self::HOOK => null,

            self::FORMAT => [
                'Comedy & Entertainment',
                'Educational & Tutorial',
                'Vlog & Daily Life',
                'Review & Unboxing',
                'Challenge & Trend',
                'Storytelling',
                'Motivational',
                'Product Showcase',
                'News & Updates',
            ],

            self::AUDIENCE => [
                'Gen Z (13–25)',
                'Millennials (26–40)',
                'Parents & Families',
                'Students',
                'Professionals',
                'Fitness & Health Lovers',
                'Foodies',
                'Gamers',
                'General Audience',
            ],

            self::TONE => [
                'Casual & Fun',
                'Professional',
                'Humorous',
                'Inspirational',
                'Educational',
                'Dramatic',
                'Trendy & Viral',
            ],
        };
    }
}
