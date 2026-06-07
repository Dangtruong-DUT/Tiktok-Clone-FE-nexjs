<?php

namespace App\Http\Resources\Api\Admin;

use App\Http\Resources\BaseJsonResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AiDocumentDetailAdminResource extends BaseJsonResource
{
    /**
     * @return array<string,mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'uuid'         => $this->uuid,
            'title'        => $this->title,
            'source_type'  => $this->source_type,
            'content_type' => $this->content_type,
            'language'     => $this->language,
            'raw_content'  => $this->raw_content,
            'chunk_count'  => $this->chunk_count,
            'is_indexed'   => (bool) $this->is_indexed,
            'indexed_at'   => $this->indexed_at?->toISOString(),
            'created_at'   => $this->created_at?->toISOString(),
            'file_url'     => $this->file_path
                ? Storage::disk($this->file_disk ?? config('filesystems.default'))->url($this->file_path)
                : null,
        ];
    }
}
