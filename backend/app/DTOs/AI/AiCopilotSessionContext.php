<?php

namespace App\DTOs\AI;

final readonly class AiCopilotSessionContext
{
    public function __construct(
        public ?string $videoTitle       = null,
        public ?string $videoDescription = null,
        public ?string $videoCategory    = null,
        public ?string $videoTranscript  = null,
        public ?string $ocrText          = null,
        public string  $creatorLanguage  = 'vi',
        public ?string $uploadSessionUuid = null,
        public ?string $postUuid         = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            videoTitle:        $data['video_title'] ?? null,
            videoDescription:  $data['video_description'] ?? null,
            videoCategory:     $data['video_category'] ?? null,
            videoTranscript:   $data['video_transcript'] ?? null,
            ocrText:           $data['ocr_text'] ?? null,
            creatorLanguage:   $data['creator_language'] ?? 'vi',
            uploadSessionUuid: $data['upload_session_uuid'] ?? null,
            postUuid:          $data['post_uuid'] ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'video_title'        => $this->videoTitle,
            'video_description'  => $this->videoDescription,
            'video_category'     => $this->videoCategory,
            'video_transcript'   => $this->videoTranscript,
            'ocr_text'           => $this->ocrText,
            'creator_language'   => $this->creatorLanguage,
            'upload_session_uuid' => $this->uploadSessionUuid,
            'post_uuid'          => $this->postUuid,
        ], fn ($v) => $v !== null);
    }

    public function toPromptContext(): string
    {
        $parts = [];

        if ($this->videoTitle) {
            $parts[] = "Video Title: {$this->videoTitle}";
        }
        if ($this->videoDescription) {
            $parts[] = "Description: {$this->videoDescription}";
        }
        if ($this->videoCategory) {
            $parts[] = "Category: {$this->videoCategory}";
        }
        if ($this->videoTranscript) {
            $parts[] = "Transcript: {$this->videoTranscript}";
        }
        if ($this->ocrText) {
            $parts[] = "On-screen Text: {$this->ocrText}";
        }

        return implode("\n", $parts);
    }
}
