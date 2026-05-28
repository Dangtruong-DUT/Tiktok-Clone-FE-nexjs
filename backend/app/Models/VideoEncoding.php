<?php

namespace App\Models;

use App\Enums\Video\VideoEncodingStatusEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;

class VideoEncoding extends Model
{
    use HasUuidObservable;

    protected $fillable = [
        'upload_file_id',
        'status',
        'master_playlist_path',
        'duration',
        'encoding_progress',
        'error_message',
        'resolutions',
        'metadata',
        'started_at',
        'completed_at',
    ];

    protected $appends = [
        'master_playlist_url',
    ];

    protected function casts(): array
    {
        return [
            'status' => VideoEncodingStatusEnum::class,
            'resolutions' => 'array',
            'metadata' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function uploadFile(): BelongsTo
    {
        return $this->belongsTo(UploadFile::class);
    }

    public function masterPlaylistUrl(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (! $this->master_playlist_path) {
                    return null;
                }

                /** @var FilesystemAdapter $disk */
                $disk = Storage::disk('s3');

                return $disk->url($this->master_playlist_path);
            }
        );
    }
}
