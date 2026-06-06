<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiDocument extends Model
{
    protected $fillable = [
        'uuid',
        'title',
        'source_type',
        'source_url',
        'raw_content',
        'content_type',
        'chunk_count',
        'language',
        'is_indexed',
        'indexed_at',
    ];

    protected $casts = [
        'is_indexed' => 'boolean',
        'indexed_at' => 'datetime',
        'chunk_count' => 'integer',
    ];

    public function chunks(): HasMany
    {
        return $this->hasMany(AiDocumentChunk::class)->orderBy('chunk_index');
    }

    public function scopeIndexed($query)
    {
        return $query->where('is_indexed', true);
    }

    public function scopeBySourceType($query, string $type)
    {
        return $query->where('source_type', $type);
    }
}
