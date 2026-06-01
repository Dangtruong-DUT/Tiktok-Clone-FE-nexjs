<?php

namespace App\DTOs\AI;

final class AiContentStudioOutputData
{
    /** @param  string[]  $hashtags */
    public function __construct(
        public readonly string  $shortCaption,
        public readonly string  $professionalCaption,
        public readonly string  $viralCaption,
        public readonly array   $hashtags,
        public readonly string  $topic,
        public readonly string  $categorySuggestion,
        public readonly string  $targetAudience,
        public readonly string  $contentIntent,
        public readonly float   $confidenceScore,
        public readonly ?string $safetyNotes,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            shortCaption:        (string) ($data['short_caption']        ?? ''),
            professionalCaption: (string) ($data['professional_caption'] ?? ''),
            viralCaption:        (string) ($data['viral_caption']        ?? ''),
            hashtags:            (array)  ($data['hashtags']             ?? []),
            topic:               (string) ($data['topic']                ?? ''),
            categorySuggestion:  (string) ($data['category_suggestion']  ?? ''),
            targetAudience:      (string) ($data['target_audience']      ?? ''),
            contentIntent:       (string) ($data['content_intent']       ?? 'other'),
            confidenceScore:     (float)  ($data['confidence_score']     ?? 0.5),
            safetyNotes:         isset($data['safety_notes']) ? (string) $data['safety_notes'] : null,
        );
    }

    public function toArray(): array
    {
        return [
            'short_caption'        => $this->shortCaption,
            'professional_caption' => $this->professionalCaption,
            'viral_caption'        => $this->viralCaption,
            'hashtags'             => $this->hashtags,
            'topic'                => $this->topic,
            'category_suggestion'  => $this->categorySuggestion,
            'target_audience'      => $this->targetAudience,
            'content_intent'       => $this->contentIntent,
            'confidence_score'     => $this->confidenceScore,
            'safety_notes'         => $this->safetyNotes,
        ];
    }
}
