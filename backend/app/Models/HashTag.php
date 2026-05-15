<?php

namespace App\Models;

use App\Traits\HasUuidObservable;
use Illuminate\Database\Eloquent\Model;

class Hashtag extends Model
{
    use HasUuidObservable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
    ];

    /*
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the posts associated with the hashtag.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany The relationship instance.
     */
    public function posts()
    {
        return $this->belongsToMany(Post::class, 'posts_hashtags')
            ->withPivot(['start', 'end']);
    }
}
