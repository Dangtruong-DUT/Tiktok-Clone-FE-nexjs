<?php

namespace App\Http\Resources\Api\Upload;

use App\Models\VideoUploadSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin VideoUploadSession
 */
class VideoUploadStatusResource extends JsonResource
{
    /**
     * Transform the session into the status-polling payload sent to the client.
     *
     * @return array{session_uuid: string, status: int, status_label: string, is_terminal: bool, encoding_progress: int, master_playlist_url: string|null, metadata: array<string, mixed>|null}
     */
    public function toArray(Request $request): array
    {
        $encoding = $this->videoEncoding;

        return [
            'session_uuid'        => $this->uuid,
            'status'              => $this->status->value,
            'status_label'        => $this->status->label(),
            'is_terminal'         => $this->status->isTerminal(),
            'encoding_progress'   => $encoding?->encoding_progress ?? 0,
            'master_playlist_url' => $encoding?->master_playlist_url,
            'metadata'            => $this->metadata,
        ];
    }
}
