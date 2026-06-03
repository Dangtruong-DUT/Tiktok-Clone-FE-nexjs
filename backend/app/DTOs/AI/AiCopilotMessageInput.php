<?php

namespace App\DTOs\AI;

final readonly class AiCopilotMessageInput
{
    public function __construct(
        public string  $content,
        public ?array  $frames       = null,   // base64 PNG strings
        public ?float  $timelineStart = null,
        public ?float  $timelineEnd   = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        $attachments = $data['attachments'] ?? [];

        return new self(
            content:       $data['content'],
            frames:        $attachments['frames'] ?? null,
            timelineStart: isset($attachments['timeline']['start_seconds'])
                ? (float) $attachments['timeline']['start_seconds']
                : null,
            timelineEnd:   isset($attachments['timeline']['end_seconds'])
                ? (float) $attachments['timeline']['end_seconds']
                : null,
        );
    }

    public function hasFrames(): bool
    {
        return ! empty($this->frames);
    }

    public function hasTimeline(): bool
    {
        return $this->timelineStart !== null && $this->timelineEnd !== null;
    }

    public function attachmentsMeta(): array
    {
        $meta = [];

        if ($this->hasFrames()) {
            $meta['frame_count'] = count($this->frames);
        }

        if ($this->hasTimeline()) {
            $meta['timeline'] = [
                'start' => $this->timelineStart,
                'end'   => $this->timelineEnd,
            ];
        }

        return $meta;
    }
}
