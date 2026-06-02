<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class AiContentCalendarItemResource extends BaseJsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'uuid'                     => $this->uuid,
            'day_of_week'              => $this->day_of_week,
            'content_idea'             => $this->content_idea,
            'suggested_format'         => $this->suggested_format,
            'suggested_hashtags'       => $this->suggested_hashtags ?? [],
            'caption_draft'            => $this->caption_draft,
            'hook_idea'                => $this->hook_idea,
            'estimated_virality_score' => $this->estimated_virality_score,
            'status'                   => $this->status?->value ?? $this->status,
            'status_label'             => $this->status?->translate() ?? null,
            'draft_post_id'            => $this->draft_post_id,
            'scheduled_post'           => $this->whenLoaded('scheduledPost', fn () =>
                new ScheduledPostResource($this->scheduledPost)
            ),
            'created_at'               => $this->created_at->toIso8601String(),
        ];
    }
}
