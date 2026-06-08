<?php

namespace App\Http\Resources\Api\Video;

use App\Http\Resources\BaseJsonResource;
use App\Models\VideoEncoding;
use Illuminate\Http\Request;

/** @mixin VideoEncoding */
class VideoEncodingStatusResource extends BaseJsonResource
{
    /** @return array<string,mixed> */
    public function toArray(Request $request): array
    {
        return [
            'status'              => $this->status->value,
            'status_label'        => $this->status->label(),
            'progress'            => $this->encoding_progress,
            'master_playlist_url' => $this->master_playlist_url,
            'duration'            => $this->duration,
            'width'               => $this->metadata['original_width'] ?? null,
            'height'              => $this->metadata['original_height'] ?? null,
            'resolutions'         => $this->resolutions,
        ];
    }
}
