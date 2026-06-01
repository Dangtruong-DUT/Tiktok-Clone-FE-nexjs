<?php

namespace App\Http\Resources;

use App\Enums\Ai\AiContentSuggestionStatusEnum;
use Illuminate\Http\Request;

class AiContentSuggestionResource extends BaseJsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string,mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid'                 => $this->uuid,
            'status'               => $this->status instanceof AiContentSuggestionStatusEnum
                ? $this->status->value
                : $this->status,
            'status_label'         => $this->status instanceof AiContentSuggestionStatusEnum
                ? $this->status->translate()
                : $this->status,
            'short_caption'        => $this->short_caption,
            'professional_caption' => $this->professional_caption,
            'viral_caption'        => $this->viral_caption,
            'hashtags'             => $this->hashtags ?? [],
            'topic'                => $this->topic,
            'category_suggestion'  => $this->category_suggestion,
            'target_audience'      => $this->target_audience,
            'content_intent'       => $this->content_intent?->value ?? $this->content_intent,
            'confidence_score'     => $this->confidence_score,
            'safety_notes'         => $this->safety_notes,
            'provider'             => $this->provider,
            'model'                => $this->model,
            'prompt_version'       => $this->prompt_version,
            'error_message'        => $this->when(
                $this->status === AiContentSuggestionStatusEnum::FAILED,
                $this->error_message
            ),
            'applied_at'           => $this->applied_at?->toIso8601String(),
            'generated_at'         => $this->generated_at?->toIso8601String(),
            'created_at'           => $this->created_at->toIso8601String(),
        ];
    }
}
