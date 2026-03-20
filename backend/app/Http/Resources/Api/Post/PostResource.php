<?php
namespace App\Http\Resources\Api\Post;

use App\Http\Resources\BaseJsonResource;
use App\Http\Resources\Api\Hashtag\HashTagResource;
use App\Http\Resources\Api\Media\MediaResource;
use App\Http\Resources\Api\Mention\MentionResource;

class PostResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
        'id' => $this->id,
        'uuid' => $this->uuid,
        'user_id' => $this->user_id,
        'type' => $this->type->value,
        'audience' => $this->audience->value,
        'content' => $this->content,
        'parent_id' => $this->parent_id,
        'hashtags' => HashTagResource::collection($this->hashtags),
        'created_at' => $this->created_at->toDateTimeString(),
        'updated_at' => $this->updated_at->toDateTimeString(),
        'medias' => MediaResource::collection($this->medias),
        'mentions' => MentionResource::collection($this->mentions),
        'likes_count' => $this->likes_count,
        'bookmarks_count' => $this->bookmarks_count,
        'repost_count' => $this->repost_count,
        'comments_count' => $this->comments_count,
        'quote_post_count' => $this->quote_post_count,
        'is_liked' => $this->is_liked,
        'is_bookmarked' => $this->is_bookmarked,
        'guest_views' => $this->guest_views,
        'user_views' => $this->user_views,
        'author' => new UserResource($this->author),
        'thumbnail_url' => $this->thumbnail_url,
        ];
    }
}
