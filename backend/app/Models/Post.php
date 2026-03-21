<?php

namespace App\Models;

use App\Enums\Post\AudienceTypeEnum;
use App\Enums\Post\PostTypeEnum;
use App\Traits\HasUuidObservable;
use App\Models\Hashtag;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasUuidObservable;


    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'content',
        'type',
        'parent_id',
        'file_id',
        'audience',
        'likes_count',
        'shares_count',
        'comments_count',
        'bookmarks_count',
        'repost_count',
        'quote_post_count',
        'guest_views',
        'user_views',
        'thumbnail_file_id',
    ];

    /*
    * Get the attributes that should be cast.
    *
    * @return array<string, string>
    */
    protected function casts(): array
    {
        return [
            'audience' => AudienceTypeEnum::class,
            'type'=>PostTypeEnum::class,
            'is_owner' => 'boolean',
            'is_liked' => 'boolean',
            'likes_count' => 'integer',
            'bookmarks_count' => 'integer',
            'repost_count' => 'integer',
            'comments_count' => 'integer',
            'quote_post_count' => 'integer',
            'guest_views' => 'integer',
            'user_views' => 'integer',
            'is_bookmarked' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }


    /**
     * Get the user that owns the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the thumbnail file of the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
    public function thumbnailFile(): BelongsTo
    {
        return $this->belongsTo(UploadFile::class, 'thumbnail_file_id');
    }

    /**
     * Get the thumbnail URL of the post.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute The thumbnail URL attribute.
     */
    public function thumbnailUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->thumbnailFile?->url
        );
    }


    /**
     * Get the media associated with the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany The relationship instance.
     */
    public function media(): HasMany
    {
        return $this->hasMany(Media::class);
    }

    /**
     * Get the hashtags associated with the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany The relationship instance.
     */
    public function hashtags(): BelongsToMany
    {
        return $this->belongsToMany(Hashtag::class, 'posts_hashtags', 'post_id', 'hashtag_id');
    }

    /**
     * Get the users mentioned in the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany The relationship instance.
     */
    public function mentions(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'posts_mentions', 'post_id', 'user_id');
    }

    /**
     * Get the parent post if this post is a repost or quote post or comment.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo The relationship instance.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'parent_id');
    }

    /**
    * Get the child posts that are reposts or quote posts or comments of this post.
    *
    * @return \Illuminate\Database\Eloquent\Relations\HasMany The relationship instance.
    */
    public function children(): HasMany
    {
        return $this->hasMany(Post::class, 'parent_id');
    }

    /**
     * Get the users that liked the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany The relationship instance.
     */
    public function userLikes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_likes', 'post_id', 'user_id');
    }

    /**
     * Get the users that bookmarked the post.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany The relationship instance.
     */
    public function userBookmarks(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_bookmarks', 'post_id', 'user_id');
    }

}
