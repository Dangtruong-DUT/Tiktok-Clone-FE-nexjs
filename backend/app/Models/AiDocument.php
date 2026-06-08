<?php

namespace App\Models;

use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class AiDocument extends Model
{
    use HasUuidObservable;

    protected $fillable = [
        'title',
        'description',
        'source_type',
        'source_url',
        'file_path',
        'file_disk',
        'upload_file_id',
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

    /**
     * Get the chunks associated with the document.
     *
     * @return HasMany<AiDocumentChunk>
     */
    public function chunks(): HasMany
    {
        return $this->hasMany(AiDocumentChunk::class)->orderBy('chunk_index');
    }

    /**
     * Get the upload file record for this document.
     *
     * @return BelongsTo<UploadFile, self>
     */
    public function uploadFile(): BelongsTo
    {
        return $this->belongsTo(UploadFile::class, 'upload_file_id');
    }

    /**
     * Get the public URL for the stored file.
     *
     * @return Attribute<string|null, never>
     */
    public function url(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->file_path
                ? Storage::disk($this->file_disk ?? config('filesystems.default'))->url($this->file_path)
                : null,
        );
    }

    /**
     * Scope a query to only include indexed documents.
     *
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeIndexed(Builder $query): Builder
    {
        return $query->where('is_indexed', true);
    }

    /**
     * @param  Builder<self>  $query
     * @return Builder<self>
     */
    public function scopeBySourceType(Builder $query, string $type): Builder
    {
        return $query->where('source_type', $type);
    }
}
