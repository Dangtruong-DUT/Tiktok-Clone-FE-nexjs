<?php
namespace App\Http\Resources\Api\Post;

use App\Http\Resources\BaseJsonResource;
use App\Http\Resources\Api\Hashtag\HashTagResource;
use App\Http\Resources\Api\Media\MediaResource;
use App\Http\Resources\Api\Mention\MentionResource;
use App\Http\Resources\Api\User\UserResource;

class PostResource extends BaseJsonResource
{

    public function toArray($request): array
    {
        $this->requireAttribute('is_liked');
        $this->requireAttribute('is_bookmarked');

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'user_id' => $this->user_id,
            'type' => $this->type->value,
            'audience' => $this->audience->value,
            'content' => $this->content,
            'parent_id' => $this->parent_id,
            'hashtags' => HashTagResource::collection($this->whenLoaded('hashtags'))->resolve(),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'medias' => MediaResource::collection($this->whenLoaded('media'))->resolve(),
            'mentions' => MentionResource::collection($this->whenLoaded('mentions'))->resolve(),
            'likes_count' => (int) ($this->likes_count ?? 0),
            'bookmarks_count' => (int) ($this->bookmarks_count ?? 0),
            'repost_count' => (int) ($this->repost_count ?? 0),
            'comments_count' => (int) ($this->comments_count ?? 0),
            'quote_post_count' => (int) ($this->quote_post_count ?? 0),
            'is_liked' => (bool) ($this->is_liked ?? false),
            'is_bookmarked' => (bool) ($this->is_bookmarked ?? false),
            'guest_views' => (int) ($this->guest_views ?? 0),
            'user_views' => (int) ($this->user_views ?? 0),
            'author' => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'thumbnail_url' => $this->thumbnail_url,
        ];
    }
}
