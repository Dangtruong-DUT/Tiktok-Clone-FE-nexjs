<?php

namespace App\Http\Resources\Api\Wellness;

use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;

class WellnessRuleResource extends BaseJsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'uuid'                   => $this->uuid,
            'type'                   => $this->type?->value ?? $this->type,
            'type_label'             => $this->type?->translate() ?? null,
            'conditions'             => $this->conditions ?? [],
            'action'                 => $this->action?->value ?? $this->action,
            'action_label'           => $this->action?->translate() ?? null,
            'title'                  => $this->title,
            'message'                => $this->message,
            'is_enabled'             => $this->is_enabled,
            'natural_language_input' => $this->natural_language_input,
            'created_at'             => $this->created_at->toIso8601String(),
            'updated_at'             => $this->updated_at->toIso8601String(),
        ];
    }
}
