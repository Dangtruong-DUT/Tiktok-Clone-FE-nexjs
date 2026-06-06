<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiDocumentChunk extends Model
{
    protected $fillable = [
        'uuid',
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
        'embedding'   => 'array',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(AiDocument::class, 'ai_document_id');
    }
}
