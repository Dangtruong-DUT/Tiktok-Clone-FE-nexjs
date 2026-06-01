<?php

namespace App\DTOs\AI;

use Illuminate\Http\Request;

final class AiContentStudioInputData
{
    public function __construct(
        public readonly ?string $videoTitle,
        public readonly ?string $videoDescription,
        public readonly ?string $videoTranscript,
        public readonly ?string $ocrText,
        public readonly string  $creatorLanguage,
        public readonly ?string $videoCategory,
        public readonly bool    $regenerate = false,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            videoTitle:       $request->input('video_title'),
            videoDescription: $request->input('video_description'),
            videoTranscript:  $request->input('video_transcript'),
            ocrText:          $request->input('ocr_text'),
            creatorLanguage:  (string) $request->input('creator_language', 'en'),
            videoCategory:    $request->input('video_category'),
            regenerate:       (bool) $request->input('regenerate', false),
        );
    }

    public static function fromArray(array $data): self
    {
        return new self(
            videoTitle:       $data['video_title']       ?? null,
            videoDescription: $data['video_description'] ?? null,
            videoTranscript:  $data['video_transcript']  ?? null,
            ocrText:          $data['ocr_text']          ?? null,
            creatorLanguage:  $data['creator_language']  ?? 'en',
            videoCategory:    $data['video_category']    ?? null,
            regenerate:       (bool) ($data['regenerate'] ?? false),
        );
    }

    public function toArray(): array
    {
        return [
            'video_title'       => $this->videoTitle,
            'video_description' => $this->videoDescription,
            'video_transcript'  => $this->videoTranscript,
            'ocr_text'          => $this->ocrText,
            'creator_language'  => $this->creatorLanguage,
            'video_category'    => $this->videoCategory,
        ];
    }

    public function hasMinimumInput(): bool
    {
        return ! empty($this->videoTitle)
            || ! empty($this->videoDescription)
            || ! empty($this->videoTranscript)
            || ! empty($this->ocrText);
    }
}
