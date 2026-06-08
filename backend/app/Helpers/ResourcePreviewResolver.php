<?php

namespace App\Helpers;

use App\Models\Post;
use App\Models\User;

class ResourcePreviewResolver
{
    public static function resolve(string $resourceType, ?int $resourceId): ?array
    {
        if (! $resourceId) {
            return null;
        }

        return match ($resourceType) {
            'post', 're-post', 'quote-post' => static::resolvePost($resourceId),
            'comment' => static::resolveComment($resourceId),
            'user' => static::resolveUser($resourceId),
            default => null,
        };
    }

    public static function resolveByUuid(string $resourceType, ?string $resourceUuid): ?array
    {
        if (! $resourceUuid) {
            return null;
        }

        return match ($resourceType) {
            'post', 're-post', 'quote-post' => static::resolvePostByUuid($resourceUuid),
            'comment' => static::resolveCommentByUuid($resourceUuid),
            'user' => static::resolveUserByUuid($resourceUuid),
            default => null,
        };
    }

    private static function resolvePost(int $resourceId): ?array
    {
        $post = Post::withTrashed()
            ->with(['user' => fn ($q) => $q->select(['id', 'username', 'avatar_file_id'])->with('avatarFile:id,file_path,disk')])
            ->select(['id', 'uuid', 'user_id', 'content', 'thumbnail_file_id', 'likes_count', 'comments_count', 'deleted_at', 'created_at'])
            ->find($resourceId);

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

    private static function resolveComment(int $resourceId): ?array
    {
        $comment = Post::withTrashed()
            ->with(['user' => fn ($q) => $q->select(['id', 'username', 'avatar_file_id'])->with('avatarFile:id,file_path,disk')])
            ->select(['id', 'uuid', 'user_id', 'content', 'deleted_at', 'created_at'])
            ->find($resourceId);

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

    private static function resolveUser(int $resourceId): ?array
    {
        $user = User::select(['id', 'uuid', 'username', 'avatar_file_id', 'banned_at', 'deleted_at'])
            ->with('avatarFile:id,file_path,disk')
            ->find($resourceId);

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

    private static function resolvePostByUuid(string $resourceUuid): ?array
    {
        $post = Post::withTrashed()
            ->with(['user' => fn ($q) => $q->select(['id', 'username', 'avatar_file_id'])->with('avatarFile:id,file_path,disk')])
            ->select(['id', 'uuid', 'user_id', 'content', 'thumbnail_file_id', 'likes_count', 'comments_count', 'deleted_at', 'created_at'])
            ->where('uuid', $resourceUuid)
            ->first();

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

    private static function resolveCommentByUuid(string $resourceUuid): ?array
    {
        $comment = Post::withTrashed()
            ->with(['user' => fn ($q) => $q->select(['id', 'username', 'avatar_file_id'])->with('avatarFile:id,file_path,disk')])
            ->select(['id', 'uuid', 'user_id', 'content', 'deleted_at', 'created_at'])
            ->where('uuid', $resourceUuid)
            ->first();

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

    private static function resolveUserByUuid(string $resourceUuid): ?array
    {
        $user = User::select(['id', 'uuid', 'username', 'avatar_file_id', 'banned_at', 'deleted_at'])
            ->with('avatarFile:id,file_path,disk')
            ->where('uuid', $resourceUuid)
            ->first();

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
