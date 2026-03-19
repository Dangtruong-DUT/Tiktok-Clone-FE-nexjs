<?php

namespace App\Models;

use App\Enums\Media\MediaType;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Media extends Model
{
    use HasUuidObservable;
    use SoftDeletes;


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

    /*
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
    protected function casts(): array
    {
        return [
            'type'=>MediaType::class,
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

    /**
     * Get the URL of the media.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute The URL attribute instance.
     */
    public function url(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->file?->url
        );
    }
}
