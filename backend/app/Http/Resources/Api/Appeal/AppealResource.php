<?php

namespace App\Http\Resources\Api\Appeal;

use App\Helpers\ResourcePreviewResolver;
use App\Http\Resources\BaseJsonResource;

class AppealResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'user_id' => $this->user_id,
            'appeal_type' => $this->appeal_type->value,
            'resource_id' => $this->resource_id,
            'resource_type' => $this->resource_type,
            'reason' => $this->reason,
            'status' => $this->status->value,
            'admin_response' => $this->admin_response,
            'evidence_files' => $this->evidence_files->map(fn ($file) => [
                'id' => $file->id,
                'url' => $file->url,
                'file_name' => $file->file_name,
            ])->values()->toArray(),
            'resource_preview' => $this->resolveResourcePreview(),
            'reviewed_at' => $this->reviewed_at?->toDateTimeString(),
            'user' => $this->when($this->relationLoaded('user'), fn () => [
                'id' => $this->user->id,
                'uuid' => $this->user->uuid,
                'username' => $this->user->username,
                'name' => $this->user->name,
                'avatar' => $this->user->avatar_url,
            ]),
            'reviewer' => $this->when($this->relationLoaded('reviewer') && $this->reviewer, fn () => [
                'id' => $this->reviewer->id,
                'uuid' => $this->reviewer->uuid,
                'username' => $this->reviewer->username,
                'name' => $this->reviewer->name,
                'avatar' => $this->reviewer->avatar_url,
            ]),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }

    private function resolveResourcePreview(): ?array
    {
        return ResourcePreviewResolver::resolve($this->resource_type, $this->resource_id);
    }
}