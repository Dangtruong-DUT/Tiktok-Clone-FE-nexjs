<?php

namespace App\Models;

use App\Enums\Video\UploadTypeEnum;
use App\Enums\Video\VideoUploadStatusEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
class VideoUploadSession extends Model
{
    use HasUuidObservable, SoftDeletes;

    protected $fillable = [
        'user_id',
        'file_name',
        'mime_type',
        'file_size',
        'disk',
        'storage_key',
        'upload_id',
        'upload_type',
        'status',
        'metadata',
        'upload_file_id',
        'video_encoding_id',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'status'      => VideoUploadStatusEnum::class,
            'upload_type' => UploadTypeEnum::class,
            'metadata'    => 'array',
            'file_size'   => 'integer',
            'expires_at'  => 'datetime',
        ];
    }

    /**
     * User who initiated the upload session.
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The uploaded file, once the session is completed.
     * @return BelongsTo
     */
    public function uploadFile(): BelongsTo
    {
        return $this->belongsTo(UploadFile::class);
    }

    /**
     * The video encoding job associated with this upload session.
     * @return BelongsTo
     */
    public function videoEncoding(): BelongsTo
    {
        return $this->belongsTo(VideoEncoding::class);
    }

    /**
     * Determine whether this session belongs to the given user.
     * @param int $userId
     * @return bool
     */
    public function isOwnedBy(int $userId): bool
    {
        return $this->user_id === $userId;
    }
}