<?php

namespace App\Http\Resources\Api\Appeal;

use App\Http\Resources\BaseJsonResource;
use App\Http\Resources\Api\User\UserResource;

/**
 * AppealResource - Format appeal data for API responses.
 * Admin identity (reviewed_by) is intentionally excluded for user-facing endpoints.
 * Evidence files are resolved from stored file IDs to include url + original filename.
 */
class AppealResource extends BaseJsonResource
{
    /**
     * Transform the resource into an array
     * @param mixed $request
     * @return array
     */
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
            'evidence_files' => $this->whenLoaded('evidence_files', function () {
                return $this->evidence_files->map(fn($file) => [
                    'id' => $file->id,
                    'url' => $file->url,
                    'file_name' => $file->file_name,
                ])->values()->toArray();
            }),
            'reviewed_by' => $this->reviewer->name,
            'reviewed_at' => $this->reviewed_at?->toDateTimeString(),
            'appeal_token_expires_at' => $this->appeal_token_expires_at?->toDateTimeString(),
            'user' => UserResource::make($this->whenLoaded('user')),
            'reviewer' => UserResource::make($this->whenLoaded('reviewer')),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
