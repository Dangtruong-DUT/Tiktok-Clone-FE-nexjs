<?php

namespace App\Models;

use App\Enums\Media\MediaTypeEnum;
use App\Enums\Video\VideoEncodingStatusEnum;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use HasUuidObservable;
    use SoftDeletes;

    protected $table = 'medias';

    protected $fillable = [
        'post_id',
        'type',
        'upload_file_id',
        'order',
    ];

    protected $appends = [
        'url',
    ];

    protected function casts(): array
    {
        return [
            'type' => MediaTypeEnum::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function file()
    {
        return $this->belongsTo(UploadFile::class, 'upload_file_id');
    }

    public function url(): Attribute
    {
        return Attribute::make(
            get: function () {
                if ($this->type === MediaTypeEnum::HLS_VIDEO) {
                    $encoding = $this->file?->videoEncoding;

                    if ($encoding && $encoding->status === VideoEncodingStatusEnum::READY) {
                        return $encoding->master_playlist_url;
                    }
                }

                return $this->file?->url;
            }
        );
    }
}
