<?php

namespace App\Models;

use App\Traits\HasToken;
use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class UploadFile extends Model
{
    use HasToken;
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
        'url',
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
     *  @return \Illuminate\Database\Eloquent\Relations\HasOne The relationship instance.
     */
    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'avatar_file_id');
    }
}
