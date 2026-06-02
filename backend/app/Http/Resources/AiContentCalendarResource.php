<?php

namespace App\Http\Resources;

use App\Enums\Ai\AiContentSuggestionStatusEnum;
use Illuminate\Http\Request;

class AiContentCalendarResource extends BaseJsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'uuid'               => $this->uuid,
            'status'             => $this->status instanceof AiContentSuggestionStatusEnum
                ? $this->status->value
                : $this->status,
            'niche'              => $this->niche,
            'content_style'      => $this->content_style,
            'posting_frequency'  => $this->posting_frequency,
            'primary_goals'      => $this->primary_goals ?? [],
            'target_audience'    => $this->target_audience,
            'creator_language'   => $this->creator_language,
            'weekly_themes'      => $this->weekly_themes ?? [],
            'strategy_notes'     => $this->strategy_notes,
            // items_count: available from withCount('items') on list queries; falls back to collection count on detail
            'items_count'        => $this->whenLoaded(
                'items',
                fn () => $this->items->count(),
                $this->items_count ?? 0
            ),
            'items'              => AiContentCalendarItemResource::collection(
                $this->whenLoaded('items')
            )->resolve(),
            'generated_at'       => $this->generated_at?->toIso8601String(),
            'created_at'         => $this->created_at->toIso8601String(),
        ];
    }
}
