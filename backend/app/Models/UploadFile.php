<?php

namespace App\Models;

use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;

class UploadFile extends Model
{
    use HasUuidObservable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'file_name',
        'mime_type',
        'file_size',
        'file_path',
        'disk',
        'expires_at',
    ];

    /*
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
        ];
    }

    /**
     * et the user whose avatar is this file.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne The relationship instance.
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'avatar_file_id');
    }

    /**
     * Check if the file is expired.
     *
     * @return bool True if the file is expired, false otherwise.
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function videoEncoding(): HasOne
    {
        return $this->hasOne(VideoEncoding::class);
    }

    public function url(): Attribute
    {
        return Attribute::make(
            get: function () {
                /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
                $disk = Storage::disk($this->disk);

                return $disk->url($this->file_path);
            }
        );
    }
}
