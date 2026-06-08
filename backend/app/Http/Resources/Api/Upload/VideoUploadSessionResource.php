<?php

namespace App\Http\Resources\Api\Upload;

use App\Models\VideoUploadSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin VideoUploadSession
 */
class VideoUploadSessionResource extends JsonResource
{
    public function __construct(
        mixed $resource,
        private readonly ?string $presignedUrl = null,
    ) {
        parent::__construct($resource);
    }

    /**
     * Transform the session into the init-response payload sent to the client.
     *
     * @return array{session_uuid: string, upload_type: string, upload_id: string|null, presigned_url: string|null, chunk_size_bytes: int, expires_at: string|null}
     */
    public function toArray(Request $request): array
    {
        return [
            'session_uuid'     => $this->uuid,
            'upload_type'      => $this->upload_type->value,
            'upload_id'        => $this->upload_id,
            'presigned_url'    => $this->presignedUrl,
            'chunk_size_bytes' => (int) config('video.upload.chunk_size_bytes'),
            'expires_at'       => $this->expires_at?->toIso8601String(),
        ];
    }
}
