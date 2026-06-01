<?php

namespace App\Http\Resources\Api\Admin;

use App\Enums\Ai\AiContentSuggestionStatusEnum;
use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class AiSuggestionAdminResource extends BaseJsonResource
{
    /**
     * @return array<string,mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid'                 => $this->uuid,
            'user'                 => $this->whenLoaded('user', fn () => [
                'uuid'     => $this->user->uuid,
                'name'     => $this->user->name,
                'username' => $this->user->username,
            ]),
            'status'               => $this->status instanceof AiContentSuggestionStatusEnum
                ? $this->status->value
                : $this->status,
            'status_label'         => $this->status instanceof AiContentSuggestionStatusEnum
                ? $this->status->translate()
                : $this->status,
            'provider'             => $this->provider,
            'model'                => $this->model,
            'prompt_version'       => $this->prompt_version,
            'creator_language'     => $this->creator_language,
            'content_intent'       => $this->content_intent?->value ?? $this->content_intent,
            'confidence_score'     => $this->confidence_score,
            'token_usage'          => $this->token_usage,
            'safety_notes'         => $this->safety_notes,
            'error_message'        => $this->error_message,
            'short_caption'        => $this->short_caption,
            'professional_caption' => $this->professional_caption,
            'viral_caption'        => $this->viral_caption,
            'hashtags'             => $this->hashtags ?? [],
            'applied_at'           => $this->applied_at?->toIso8601String(),
            'generated_at'         => $this->generated_at?->toIso8601String(),
            'created_at'           => $this->created_at->toIso8601String(),
        ];
    }
}
