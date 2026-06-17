<?php

namespace App\DTOs\AI;

final readonly class AiCopilotMessageInput
{
    public function __construct(
        public string  $content,
        public ?array  $frames          = null,
        public ?float  $timelineStart   = null,
        public ?float  $timelineEnd     = null,
        public ?string $videoClip       = null,
        public ?string $surface         = null,
        public ?string $currentCaption  = null,
        public ?string $currentHashtags = null,
    ) {}

    public static function fromRequest(array $data): self
    {
        $attachments    = $data['attachments']     ?? [];
        $currentContent = $data['current_content'] ?? [];

        return new self(
            content:         $data['content'],
            frames:          $attachments['frames'] ?? null,
            timelineStart:   isset($attachments['timeline']['start_seconds'])
                ? (float) $attachments['timeline']['start_seconds']
                : null,
            timelineEnd:     isset($attachments['timeline']['end_seconds'])
                ? (float) $attachments['timeline']['end_seconds']
                : null,
            videoClip:       $attachments['video_clip'] ?? null,
            surface:         $data['surface'] ?? null,
            currentCaption:  $currentContent['caption']  ?? null,
            currentHashtags: $currentContent['hashtags'] ?? null,
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

    public function hasVideoClip(): bool
    {
        return $this->videoClip !== null && $this->videoClip !== '';
    }

    public function hasCurrentContent(): bool
    {
        return $this->currentCaption !== null
            || $this->currentHashtags !== null;
    }

    public function videoClipBase64(): string
    {
        return (string) preg_replace('/^data:video\/\w+;base64,/', '', (string) $this->videoClip);
    }

    public function attachmentsMeta(): array
    {
        $meta = [];

        if ($this->hasFrames()) {
            $meta['frame_count'] = count($this->frames);
        }

        if ($this->hasVideoClip()) {
            $meta['video_clip'] = true;
        }

        if ($this->hasTimeline()) {
            $meta['timeline'] = [
                'start' => $this->timelineStart,
                'end'   => $this->timelineEnd,
            ];
        }

        if ($this->surface) {
            $meta['surface'] = $this->surface;
        }

        return $meta;
    }
}
