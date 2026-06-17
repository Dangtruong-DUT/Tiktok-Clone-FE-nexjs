<?php

namespace App\DTOs\AI;

final readonly class AiCopilotSessionContext
{
    public function __construct(
        public ?string $videoDescription  = null,
        public ?string $videoCategory     = null,
        public ?string $videoTranscript   = null,
        public ?string $ocrText           = null,
        public string  $creatorLanguage   = 'vi',
        public ?string $uploadSessionUuid = null,
        public ?string $postUuid          = null,
        public ?string $surface           = null,
        // Live form content — updated with each message, not just at session start
        public ?string $currentCaption    = null,
        public ?string $currentHashtags   = null,
        // Runtime-only: populated at request time, never persisted to context_snapshot
        public ?int    $userId            = null,
        public ?string $userRole          = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            videoDescription:  $data['video_description']  ?? null,
            videoCategory:     $data['video_category']     ?? null,
            videoTranscript:   $data['video_transcript']   ?? null,
            ocrText:           $data['ocr_text']           ?? null,
            creatorLanguage:   $data['creator_language']   ?? 'vi',
            uploadSessionUuid: $data['upload_session_uuid'] ?? null,
            postUuid:          $data['post_uuid']          ?? null,
            surface:           $data['surface']           ?? null,
            currentCaption:    $data['current_caption']    ?? null,
            currentHashtags:   $data['current_hashtags']   ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'video_description'   => $this->videoDescription,
            'video_category'      => $this->videoCategory,
            'video_transcript'    => $this->videoTranscript,
            'ocr_text'            => $this->ocrText,
            'creator_language'    => $this->creatorLanguage,
            'upload_session_uuid' => $this->uploadSessionUuid,
            'post_uuid'           => $this->postUuid,
            'surface'             => $this->surface,
            'current_caption'     => $this->currentCaption,
            'current_hashtags'    => $this->currentHashtags,
        ], fn ($v) => $v !== null);
    }

    public function toPromptContext(): string
    {
        $parts = [];

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
        if ($this->surface) {
            $parts[] = "Surface: {$this->surface}";
        }

        // Live form content — always the most recent draft from the creator
        if ($this->currentCaption) {
            $parts[] = "\n--- Creator's current draft (use as base for rewrites) ---";
            $parts[] = "Current Caption: {$this->currentCaption}";
        }
        if ($this->currentHashtags) {
            $parts[] = "Current Hashtags: {$this->currentHashtags}";
        }

        return implode("\n", $parts);
    }

    public function isStudioEditorSurface(): bool
    {
        return $this->surface === 'studio_editor';
    }

    public function canUseEditorContext(): bool
    {
        return $this->isStudioEditorSurface() && $this->userRole !== 'super_admin';
    }
}
