<?php

namespace App\Models;

use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiDocumentChunk extends Model
{
    use HasUuidObservable;

    protected $fillable = [
        'ai_document_id',
        'chunk_index',
        'content',
        'token_count',
        'is_embedded',
        'embedding',
    ];

    protected $casts = [
        'is_embedded' => 'boolean',
        'chunk_index' => 'integer',
        'token_count' => 'integer',
        // 'embedding' intentionally omitted — column is vector(768), not JSON.
        // Read/write only via raw SQL (see EmbedDocumentChunkJob, PgVectorSearchService).
    ];

    /**
     * @return BelongsTo<AiDocument, self>
     */
    public function document(): BelongsTo
    {
        return $this->belongsTo(AiDocument::class, 'ai_document_id');
    }
}
