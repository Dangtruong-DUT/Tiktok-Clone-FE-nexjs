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

    /* The table associated with the model.
     *
     * @var string
     */
    protected $table = 'medias';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'post_id',
        'type',
        'upload_file_id',
        'order',
    ];

    /**
     * The accessors to append to model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'url',
    ];

    /*
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
    protected function casts(): array
    {
        return [
            'type' => MediaTypeEnum::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the post that owns the media.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the upload file associated with the media.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
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
