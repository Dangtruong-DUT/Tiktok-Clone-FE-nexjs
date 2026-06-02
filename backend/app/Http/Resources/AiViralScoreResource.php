<?php

namespace App\Http\Resources;

use App\Enums\Ai\AiContentSuggestionStatusEnum;
use Illuminate\Http\Request;

class AiViralScoreResource extends BaseJsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'uuid'               => $this->uuid,
            'status'             => $this->status instanceof AiContentSuggestionStatusEnum
                ? $this->status->value
                : $this->status,
            'status_label'       => $this->status instanceof AiContentSuggestionStatusEnum
                ? $this->status->translate()
                : $this->status,
            'caption'            => $this->caption,
            'hashtags'           => $this->hashtags ?? [],
            'overall_score'      => $this->overall_score,
            'level'              => $this->level?->value ?? $this->level,
            'level_label'        => $this->level?->translate() ?? null,
            'breakdown'          => $this->breakdown,
            'strengths'          => $this->strengths ?? [],
            'weaknesses'         => $this->weaknesses ?? [],
            'recommendations'    => $this->recommendations ?? [],
            'improved_caption'   => $this->improved_caption,
            'suggested_hashtags' => $this->suggested_hashtags ?? [],
            'error_message'      => $this->when(
                $this->status === AiContentSuggestionStatusEnum::FAILED,
                $this->error_message
            ),
            'analyzed_at'        => $this->analyzed_at?->toIso8601String(),
            'created_at'         => $this->created_at->toIso8601String(),
        ];
    }
}
