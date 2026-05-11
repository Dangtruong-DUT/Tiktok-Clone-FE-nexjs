<?php

namespace App\Http\Resources\Api\Appeal;

use App\Http\Resources\BaseJsonResource;
use App\Models\Post;
use App\Models\User;

/**
 * AppealResource - Format appeal data for API responses.
 * Admin identity (reviewed_by) is intentionally excluded for user-facing endpoints.
 * Evidence files are resolved from stored file IDs to include url + original filename.
 * resource_preview is included when the resource is still accessible.
 */
class AppealResource extends BaseJsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'user_id' => $this->user_id,
            'appeal_type' => $this->appeal_type->value,
            'resource_id' => $this->resource_id,
            'resource_type' => $this->resource_type,
            'reason' => $this->reason,
            'status' => $this->status->value,
            'admin_response' => $this->admin_response,
            'evidence_files' => $this->evidence_files->map(fn ($file) => [
                'id' => $file->id,
                'url' => $file->url,
                'file_name' => $file->file_name,
            ])->values()->toArray(),
            'resource_preview' => $this->resolveResourcePreview(),
            'reviewed_at' => $this->reviewed_at?->toDateTimeString(),
            'user' => $this->when($this->relationLoaded('user'), fn () => [
                'id' => $this->user->id,
                'uuid' => $this->user->uuid,
                'username' => $this->user->username,
                'name' => $this->user->name,
                'avatar' => $this->user->avatar_url,
            ]),
            'reviewer' => $this->when($this->relationLoaded('reviewer') && $this->reviewer, fn () => [
                'id' => $this->reviewer->id,
                'uuid' => $this->reviewer->uuid,
                'username' => $this->reviewer->username,
                'name' => $this->reviewer->name,
                'avatar' => $this->reviewer->avatar_url,
            ]),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }

    /**
     * Resolve a lightweight preview of the appeal resource (post, comment, or user).
     * Uses withTrashed for post/comment since the resource may have been deleted.
     * Returns null when the resource cannot be found or type is unsupported.
     */
    private function resolveResourcePreview(): ?array
    {
        if (! $this->resource_id) {
            return null;
        }

        return match ($this->resource_type) {
            'post', 're-post', 'quote-post' => $this->resolvePostPreview(),
            'comment' => $this->resolveCommentPreview(),
            'user' => $this->resolveUserPreview(),
            default => null,
        };
    }

    private function resolvePostPreview(): ?array
    {
        $post = Post::withTrashed()
            ->with('user:id,username,avatar')
            ->select(['id', 'uuid', 'user_id', 'content', 'thumbnail_url', 'likes_count', 'comments_count', 'deleted_at', 'created_at'])
            ->find($this->resource_id);

        if (! $post) {
            return null;
        }

        return [
            'type' => 'post',
            'uuid' => $post->uuid,
            'content' => $post->content,
            'thumbnail_url' => $post->thumbnail_url,
            'likes_count' => $post->likes_count ?? 0,
            'comments_count' => $post->comments_count ?? 0,
            'is_deleted' => $post->deleted_at !== null,
            'author' => $post->user ? [
                'username' => $post->user->username,
                'avatar' => $post->user->avatar_url,
            ] : null,
            'created_at' => $post->created_at?->toDateTimeString(),
        ];
    }

    private function resolveCommentPreview(): ?array
    {
        $comment = Post::withTrashed()
            ->with('user:id,username,avatar')
            ->select(['id', 'uuid', 'user_id', 'content', 'deleted_at', 'created_at'])
            ->find($this->resource_id);

        if (! $comment) {
            return null;
        }

        return [
            'type' => 'comment',
            'uuid' => $comment->uuid,
            'content' => $comment->content,
            'is_deleted' => $comment->deleted_at !== null,
            'author' => $comment->user ? [
                'username' => $comment->user->username,
                'avatar' => $comment->user->avatar_url,
            ] : null,
            'created_at' => $comment->created_at?->toDateTimeString(),
        ];
    }

    private function resolveUserPreview(): ?array
    {
        $user = User::select(['id', 'uuid', 'username', 'avatar', 'banned_at', 'deleted_at'])
            ->find($this->resource_id);

        if (! $user) {
            return null;
        }

        return [
            'type' => 'user',
            'uuid' => $user->uuid,
            'username' => $user->username,
            'avatar' => $user->avatar_url,
            'is_banned' => $user->banned_at !== null,
            'is_deleted' => $user->deleted_at !== null,
        ];
    }
}
